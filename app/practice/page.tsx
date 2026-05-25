'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { generateText, EXIT_TEST_STAGE, TOTAL_LETTER_STAGES } from '../../lib/text-generator';
import { calculateFeedback, adjustSkillLevel } from '../../lib/feedback-engine';
import {
  getSkillLevel,
  setSkillLevel as saveSkillLevelToStorage,
  saveSession,
  getProgressState,
  completeStage,
} from '../../lib/storage';
import Header from '../../components/Header';
import StatsPanel from '../../components/StatsPanel';
import TypingEngine from '../../components/TypingEngine';
import VirtualKeyboard from '../../components/VirtualKeyboard';
import ResultsModal from '../../components/ResultsModal';
import GuideModal from '../../components/GuideModal';

// Level names in Uzbek (aligned with At-Tanal)
const LEVEL_NAMES: Record<number, string> = {
  1: 'At-Tanal: Harflar darsligi',
  2: "At-Tanal: So'zlar simulyatori",
  3: 'At-Tanal: Imtihon matnlari',
};

// Preset timer options in seconds (2-10 minutes)
const TIMER_PRESETS = [
  { label: '2 daq', seconds: 120 },
  { label: '3 daq', seconds: 180 },
  { label: '4 daq', seconds: 240 },
  { label: '5 daq', seconds: 300 },
  { label: '6 daq', seconds: 360 },
  { label: '7 daq', seconds: 420 },
  { label: '8 daq', seconds: 480 },
  { label: '9 daq', seconds: 540 },
  { label: '10 daq', seconds: 600 },
];

const DEFAULT_TIME = 180; // 3 minutes

// XP rank thresholds
const RANK_THRESHOLDS = [
  { min: 0, name: "Boshlang'ich", emoji: '🌱', color: 'text-slate-400' },
  { min: 200, name: "O'rganuvchi", emoji: '📖', color: 'text-blue-400' },
  { min: 600, name: 'Mohir', emoji: '⚡', color: 'text-cyan-400' },
  { min: 1500, name: 'Usta', emoji: '🔥', color: 'text-orange-400' },
  { min: 3000, name: 'Grandmaster', emoji: '👑', color: 'text-yellow-400' },
];

function getRank(xp: number) {
  let rank = RANK_THRESHOLDS[0];
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.min) rank = t;
  }
  return rank;
}

function TimerInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">⏱ Vaqt:</span>
      <div className="flex gap-1 flex-wrap">
        {TIMER_PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => onChange(preset.seconds)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
              value === preset.seconds
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'border border-slate-800/80 bg-slate-900/30 text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Calculate the next stage URL after completing current stage
 */
function getNextStageUrl(level: number, stage: number): string | null {
  if (level === 1) {
    if (stage < TOTAL_LETTER_STAGES) return `/practice?level=1&stage=${stage + 1}`;
    if (stage === TOTAL_LETTER_STAGES) return `/practice?level=1&stage=${EXIT_TEST_STAGE}`;
    if (stage === EXIT_TEST_STAGE) return `/practice?level=2&stage=1`;
  } else if (level === 2) {
    if (stage < 3) return `/practice?level=2&stage=${stage + 1}`;
    if (stage === 3) return `/practice?level=3&stage=1`;
  } else if (level === 3) {
    if (stage < 3) return `/practice?level=3&stage=${stage + 1}`;
  }
  return null; // All completed
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse level and stage from URL
  const levelParam = parseInt(searchParams.get('level') || '1', 10);
  const level = ([1, 2, 3].includes(levelParam) ? levelParam : 1) as 1 | 2 | 3;

  const stageParam = parseInt(searchParams.get('stage') || '1', 10);
  const stage = isNaN(stageParam) ? 1 : stageParam;
  const isTest = level === 1 && stage === EXIT_TEST_STAGE;

  // Core state
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [prevSkillLevel, setPrevSkillLevel] = useState<number>(1);
  const [timeLimit, setTimeLimit] = useState<number>(DEFAULT_TIME);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIME);
  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Gamification combo states
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);

  // XP gamification
  const [xp, setXp] = useState<number>(0);
  const [xpPopup, setXpPopup] = useState<{ amount: number; id: number } | null>(null);

  // Cumulative persistent session stats (doesn't reset on new text chunk!)
  const [accumulatedMistakes, setAccumulatedMistakes] = useState<number>(0);
  const [accumulatedCorrect, setAccumulatedCorrect] = useState<number>(0);
  const [accumulatedCharsTyped, setAccumulatedCharsTyped] = useState<number>(0);

  // Live session stats (sum of accumulated + current chunk stats)
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState<number>(0);

  // Live WPM / Accuracy stats
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // === REFS for stale-closure-proof finishPractice ===
  const totalCharsTypedRef = useRef(0);
  const totalMistakesRef = useRef(0);
  const totalCorrectRef = useRef(0);
  const skillLevelRef = useRef(1);

  // Keep refs in sync with state
  useEffect(() => { totalCharsTypedRef.current = totalCharsTyped; }, [totalCharsTyped]);
  useEffect(() => { totalMistakesRef.current = totalMistakes; }, [totalMistakes]);
  useEffect(() => { totalCorrectRef.current = totalCorrect; }, [totalCorrect]);
  useEffect(() => { skillLevelRef.current = skillLevel; }, [skillLevel]);

  // Results
  const [results, setResults] = useState<{
    wpm: number;
    accuracy: number;
    errors: number;
    feedback: string;
    unlockedNext: boolean;
    nextStageUrl: string | null;
    passed: boolean;
  } | null>(null);

  // Web Audio API Synthesizer for Game Sound Effects
  const playSuccessSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context failed
    }
  }, [isMuted]);

  const playErrorSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio context failed
    }
  }, [isMuted]);

  // Load sound preferences from localStorage on mount
  useEffect(() => {
    const rawMute = localStorage.getItem('arabic_typing_muted');
    if (rawMute === 'true') {
      setIsMuted(true);
    }
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('arabic_typing_muted', String(next));
      return next;
    });
  };

  // Verify locking conditions on mount/change
  useEffect(() => {
    const progress = getProgressState();
    const isUnlocked = (() => {
      if (level < progress.unlockedLevel) return true;
      if (level > progress.unlockedLevel) return false;
      return stage <= progress.unlockedStage;
    })();
    setIsLocked(!isUnlocked);
  }, [level, stage]);

  // Reset all typing states when level or stage parameters change
  useEffect(() => {
    setStarted(false);
    setFinished(false);
    setTypedText('');
    setTargetText('');
    setAccumulatedMistakes(0);
    setAccumulatedCorrect(0);
    setAccumulatedCharsTyped(0);
    setTotalCharsTyped(0);
    setTotalMistakes(0);
    setTotalCorrect(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setTimeLeft(timeLimit);
    setCombo(0);
    setXp(0);
    setResults(null);
    startTimeRef.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [level, stage]);

  // Load skill level from storage
  useEffect(() => {
    const stored = getSkillLevel();
    setSkillLevel(stored);
    setPrevSkillLevel(stored);
  }, []);

  // Generate target text when ready
  useEffect(() => {
    if (!targetText && !isLocked) {
      setTargetText(generateText(level, skillLevel, stage));
    }
  }, [level, skillLevel, stage, targetText, isLocked]);

  // Timer logic — uses refs to avoid stale closure
  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            // Use setTimeout to call finishPractice after state settles
            setTimeout(() => finishPracticeFromRefs(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished]);

  // Calculate live WPM
  useEffect(() => {
    if (started && !finished && startTimeRef.current > 0) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
      if (elapsed > 0) {
        const words = totalCharsTyped / 5;
        setLiveWpm(Math.round(words / elapsed));
      }
    }
  }, [totalCharsTyped, started, finished]);

  // Calculate live accuracy using totalMistakes (permanent, backspace-proof)
  useEffect(() => {
    if (totalCharsTyped > 0) {
      const correctChars = totalCharsTyped - totalMistakes;
      setLiveAccuracy(Math.max(0, Math.round((correctChars / totalCharsTyped) * 100)));
    }
  }, [totalMistakes, totalCharsTyped]);

  // Finish practice session — reads from REFS to avoid stale closure
  const finishPracticeFromRefs = useCallback(() => {
    const chars = totalCharsTypedRef.current;
    const mistakes = totalMistakesRef.current;
    const skill = skillLevelRef.current;

    setFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const finalWpm = elapsed > 0 ? Math.round(chars / 5 / elapsed) : 0;
    const correctChars = chars - mistakes;
    const finalAccuracy = chars > 0 ? Math.max(0, Math.round((correctChars / chars) * 100)) : 100;

    const feedback = calculateFeedback(finalWpm, finalAccuracy, mistakes);
    const newSkill = adjustSkillLevel(skill, finalWpm, finalAccuracy);

    setPrevSkillLevel(skill);
    setSkillLevel(newSkill);
    saveSkillLevelToStorage(newSkill);

    // Save session to history
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    saveSession({
      date: new Date().toISOString(),
      wpm: finalWpm,
      accuracy: finalAccuracy,
      errors: mistakes,
      level,
      stage,
      isTest,
      duration: durationSeconds,
      feedback,
    });

    // Comprehensive strategic passing criteria aligned with At-Tanal standards
    let passed = false;
    if (level === 1) {
      if (isTest) {
        // Exit Test L1: Needs 85% accuracy and 20+ WPM
        passed = finalAccuracy >= 85 && finalWpm >= 20;
      } else {
        // Letter drills: Needs 85% accuracy (to ensure they know the keys)
        passed = finalAccuracy >= 85;
      }
    } else if (level === 2) {
      // Level 2 Words: Needs 90% accuracy and 25+ WPM (Yaxshi zo'r natija)
      passed = finalAccuracy >= 90 && finalWpm >= 25;
    } else if (level === 3) {
      // Level 3 Texts: Needs 90% accuracy and 30+ WPM (At-Tanal sertifikat darajasi)
      passed = finalAccuracy >= 90 && finalWpm >= 30;
    }

    // Unlocking next sub-level/stage logic
    let unlockedNext = false;
    if (passed) {
      const prevState = getProgressState();
      const nextState = completeStage(level, stage);

      if (nextState.unlockedStage !== prevState.unlockedStage || nextState.unlockedLevel !== prevState.unlockedLevel) {
        unlockedNext = true;
      }
    }

    const nextUrl = passed ? getNextStageUrl(level, stage) : null;

    setResults({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      errors: mistakes,
      feedback,
      unlockedNext,
      nextStageUrl: nextUrl,
      passed, // Pass the correct passed state
    });
  }, [level, stage, isTest]);

  // Handle typing inputs, cumulative statistics and combo system
  const handleTypingChange = useCallback(
    (newTyped: string, _currentErrors: number, currentCorrect: number, chunkMistakes: number) => {
      if (!started) {
        setStarted(true);
        setTimeLeft(timeLimit);
        startTimeRef.current = Date.now();
      }

      // Combo/Streak and Audio Sound feedback
      if (newTyped.length > typedText.length) {
        const lastIdx = newTyped.length - 1;
        const isCorrect = newTyped[lastIdx] === targetText[lastIdx];
        if (isCorrect) {
          playSuccessSound();
          setCombo((prev) => {
            const next = prev + 1;
            setMaxCombo((m) => Math.max(m, next));
            return next;
          });

          // XP system: base 10 XP per correct char, with combo multiplier
          const comboMultiplier = combo >= 30 ? 5 : combo >= 15 ? 3 : combo >= 5 ? 2 : 1;
          const earnedXp = 10 * comboMultiplier;
          setXp(prev => prev + earnedXp);
          setXpPopup({ amount: earnedXp, id: Date.now() });
        } else {
          playErrorSound();
          setCombo(0);
        }
      }

      // Cumulative stats: accumulated from previous chunks + current chunk
      const currentSessionMistakes = accumulatedMistakes + chunkMistakes;
      const currentSessionCorrect = accumulatedCorrect + currentCorrect;
      const currentSessionCharsTyped = accumulatedCharsTyped + newTyped.length;

      setTypedText(newTyped);
      setTotalMistakes(currentSessionMistakes);
      setTotalCorrect(currentSessionCorrect);
      setTotalCharsTyped(currentSessionCharsTyped);

      // Loop generating new text when the current text chunk is fully typed (continuous practice until timer runs out)
      if (newTyped.length >= targetText.length && !finished) {
        setAccumulatedMistakes(prev => prev + chunkMistakes);
        setAccumulatedCorrect(prev => prev + currentCorrect);
        setAccumulatedCharsTyped(prev => prev + newTyped.length);
        setTypedText('');
        setTargetText(generateText(level, skillLevel, stage));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [started, finished, targetText, typedText, level, skillLevel, stage, timeLimit, accumulatedMistakes, accumulatedCorrect, accumulatedCharsTyped, combo, playSuccessSound, playErrorSound]
  );

  const handleKeyDown = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  const handleKeyUp = useCallback(() => {
    setActiveKey('');
  }, []);

  const handleRetry = () => {
    setStarted(false);
    setFinished(false);
    setTypedText('');
    setTargetText(generateText(level, skillLevel, stage));
    setAccumulatedMistakes(0);
    setAccumulatedCorrect(0);
    setAccumulatedCharsTyped(0);
    setTotalCharsTyped(0);
    setTotalMistakes(0);
    setTotalCorrect(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setTimeLeft(timeLimit);
    setCombo(0);
    setXp(0);
    setResults(null);
    startTimeRef.current = 0;
  };

  const handleDashboard = () => {
    router.push('/');
  };

  const handleNextStage = () => {
    if (results?.nextStageUrl) {
      router.push(results.nextStageUrl);
    }
  };

  const handleTimeLimitChange = (newTime: number) => {
    if (!started) {
      setTimeLimit(newTime);
      setTimeLeft(newTime);
    }
  };

  const currentRank = getRank(xp);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between">
        <Header showBackButton />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glow-card p-12 max-w-md bg-gradient-to-br from-slate-900/10 to-red-950/5 border-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.05)]"
          >
            <span className="text-5xl mb-4 block">🔒</span>
            <h2 className="text-xl font-bold text-white mb-2">Bosqich qulflangan</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              At-Tanal imtihoniga tayyorlanishda izchillik muhim. Darsni boshlash uchun avvalgi bosqichlarni muvaffaqiyatli topshiring!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              🗺 Darslar Xaritasiga Qaytish
            </Link>
          </motion.div>
        </main>
        <footer className="py-6 text-center text-xs text-slate-700">At-Tanal Writing Academy</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col">
      <Header showBackButton />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 flex flex-col justify-center relative">
        {/* Pre-start setup UI */}
        {!started && !finished && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
          >
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 flex-wrap">
                  {LEVEL_NAMES[level]}
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-0.5 text-[10px] font-bold">
                    {isTest ? 'AT-TANAL IMTIHONI' : `${stage}-bosqich`}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Mahorat darajangiz: <span className="text-white font-bold">{skillLevel}/10</span>
                </p>
              </div>

              {/* Sound and Guide controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="rounded-xl p-2.5 text-xs sm:text-sm border flex items-center gap-2 justify-center border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer font-bold select-none"
                >
                  ℹ️ Yo&apos;riqnoma
                </button>
                <button
                  onClick={toggleMute}
                  className={`rounded-xl p-2.5 text-xs sm:text-sm border flex items-center gap-2 justify-center transition-all duration-200 ${
                    isMuted
                      ? 'border-slate-800 bg-slate-900/20 text-slate-500 hover:text-slate-400'
                      : 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  {isMuted ? '🔇 Ovoz o\'chiq' : '🔊 Ovoz yoqiq'}
                </button>
              </div>
            </div>

            {/* Timer selection */}
            <div className="glow-card p-4 bg-slate-950/20 border-slate-900/60">
              <TimerInput value={timeLimit} onChange={handleTimeLimitChange} />
              <p className="text-[11px] text-slate-500 mt-2">💡 Vaqt tugaganda natijalaringiz avtomatik saqlanadi. Yozishni boshlash uchun pastdagi maydonga bosing.</p>
            </div>
          </motion.div>
        )}

        {/* Live stats dashboard during typing */}
        {started && !finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 flex flex-col gap-3"
          >
            <StatsPanel
              wpm={liveWpm}
              accuracy={liveAccuracy}
              errors={totalMistakes}
              timeLeft={timeLeft}
              skillLevel={skillLevel}
              combo={combo}
              xp={xp}
              rank={currentRank}
            />
            
            {/* Finish early button */}
            <div className="flex justify-end">
              <button
                onClick={finishPracticeFromRefs}
                className="rounded-xl px-4 py-2 text-xs font-bold border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all select-none cursor-pointer self-end shadow-md hover:shadow-red-500/5"
              >
                🏁 Mashqni tugatish va saqlash
              </button>
            </div>
          </motion.div>
        )}

        {/* Core Typing Engine Container */}
        {!finished && targetText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 relative"
          >
            {/* Dynamic combo element */}
            <AnimatePresence>
              {combo >= 5 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: [1, 1.2, 1], opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  key={combo}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-500/30 px-5 py-1.5 rounded-full shadow-[0_0_25px_rgba(249,115,22,0.3)] text-xs font-black tracking-widest text-orange-400 select-none z-30"
                >
                  🔥 {combo} STREAK!
                  {combo >= 15 && <span className="text-yellow-400 ml-1">×{combo >= 30 ? 5 : 3}</span>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP popup */}
            <AnimatePresence>
              {xpPopup && (
                <motion.div
                  key={xpPopup.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -40, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute -top-8 right-4 text-xs font-black text-cyan-400 select-none z-30 pointer-events-none"
                >
                  +{xpPopup.amount} XP
                </motion.div>
              )}
            </AnimatePresence>

            <TypingEngine
              targetText={targetText}
              typedText={typedText}
              onTypingChange={handleTypingChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              disabled={finished}
            />
          </motion.div>
        )}

        {/* Interactive Virtual Keyboard */}
        {!finished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VirtualKeyboard 
              activeKey={activeKey} 
              nextChar={targetText && typedText.length < targetText.length ? targetText[typedText.length] : undefined} 
            />
          </motion.div>
        )}
      </main>

      {/* Results overlay modal */}
      {finished && results && (
        <ResultsModal
          wpm={results.wpm}
          accuracy={results.accuracy}
          errors={results.errors}
          skillLevel={skillLevel}
          prevSkillLevel={prevSkillLevel}
          aiFeedback={results.feedback}
          onRetry={handleRetry}
          onDashboard={handleDashboard}
          onNextStage={results.nextStageUrl ? handleNextStage : undefined}
          unlockedNext={results.unlockedNext}
          passed={results.passed} // Pass passed prop
        />
      )}

      {/* Floating help guide modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

function PracticeLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeLoading />}>
      <PracticeContent />
    </Suspense>
  );
}
