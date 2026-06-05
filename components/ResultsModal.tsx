'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ResultsModalProps {
  wpm: number;
  accuracy: number;
  errors: number;
  skillLevel: number;
  prevSkillLevel: number;
  aiFeedback: string;
  onRetry: () => void;
  onDashboard: () => void;
  onNextStage?: () => void;
  unlockedNext?: boolean;
  passed: boolean;
  level?: number;
}

export default function ResultsModal({
  wpm,
  accuracy,
  errors,
  skillLevel,
  prevSkillLevel,
  aiFeedback,
  onRetry,
  onDashboard,
  onNextStage,
  unlockedNext = false,
  passed,
  level = 1,
}: ResultsModalProps) {
  const getEmoji = () => {
    if (accuracy >= 98) return '🏆';
    if (accuracy >= 90) return '⭐';
    if (accuracy >= 75) return '💪';
    return '🔄';
  };

  const skillDiff = skillLevel - prevSkillLevel;

  // At-Tanal standards comparison based on Level
  const atTanalWpmTarget = level === 1 ? 18 : level === 2 ? 25 : 30;
  const atTanalAccuracyTarget = level === 1 ? 85 : 90;
  const wpmMet = wpm >= atTanalWpmTarget;
  const accMet = accuracy >= atTanalAccuracyTarget;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0f] p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.15), 0 0 80px rgba(37, 99, 235, 0.05)',
          }}
        >
          {/* Header */}
          <div className="mb-5 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              className="mb-2 text-5xl md:text-6xl animate-bounce"
            >
              {getEmoji()}
            </motion.div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {passed ? 'Mashq muvaffaqiyatli yakunlandi!' : 'Mashq yakunlandi'}
            </h2>
            {!passed && (
              <p className="text-xs text-orange-400 mt-1">⚠️ Keyingi bosqichga o&apos;tish uchun yuqoriroq tezlik (WPM) va aniqlik talab etiladi</p>
            )}
          </div>

          {/* Next stage unlocked banner */}
          <AnimatePresence>
            {unlockedNext && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <span className="text-xs font-black text-emerald-400 tracking-wider flex items-center justify-center gap-1.5 uppercase">
                  🎉 TABRIKLAYMIZ! KEYINGI BOSQICH OCHILDI! 🔓
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* At-Tanal Standards Comparison */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-5 rounded-xl border border-blue-500/15 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                At-Tanal Standartlariga Solishtirish
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-lg p-3 border ${wpmMet ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">Tezlik</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-extrabold ${wpmMet ? 'text-emerald-400' : 'text-orange-400'}`}>{wpm}</span>
                  <span className="text-[10px] text-slate-500">/ {atTanalWpmTarget}{level === 1 ? '' : '+'} WPM</span>
                </div>
                <span className={`text-[9px] font-bold mt-1 block ${wpmMet ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {wpmMet ? '✅ Yetilgan' : '⚠️ Yana mashq kerak'}
                </span>
              </div>
              <div className={`rounded-lg p-3 border ${accMet ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">Aniqlik</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-extrabold ${accMet ? 'text-emerald-400' : 'text-orange-400'}`}>{accuracy}%</span>
                  <span className="text-[10px] text-slate-500">/ {atTanalAccuracyTarget}%+</span>
                </div>
                <span className={`text-[9px] font-bold mt-1 block ${accMet ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {accMet ? '✅ Yetilgan' : '⚠️ Yana mashq kerak'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="text-sm font-semibold text-blue-400">AI Coach Tahlili</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{aiFeedback}</p>
          </motion.div>

          {/* Skill level change */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-5 flex items-center justify-center gap-3"
          >
            <span className="text-sm text-gray-400">Mahorat darajasi:</span>
            <span className="text-lg font-bold text-white">{skillLevel}</span>
            {skillDiff !== 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  skillDiff > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {skillDiff > 0 ? '▲' : '▼'} {Math.abs(skillDiff)}
              </motion.span>
            )}
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 grid grid-cols-3 gap-3"
          >
            <div className="glow-card rounded-xl border border-white/10 bg-white/5 p-3 md:p-4 text-center">
              <div className="mb-1 text-xl md:text-2xl font-bold text-blue-400">{wpm}</div>
              <div className="text-[10px] md:text-xs text-gray-500">WPM</div>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-white/5 p-3 md:p-4 text-center">
              <div className="mb-1 text-xl md:text-2xl font-bold text-emerald-400">{accuracy}%</div>
              <div className="text-[10px] md:text-xs text-gray-500">Aniqlik</div>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-white/5 p-3 md:p-4 text-center">
              <div className="mb-1 text-xl md:text-2xl font-bold text-red-400">{errors}</div>
              <div className="text-[10px] md:text-xs text-gray-500">Xatolar</div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-2.5"
          >
            {/* Next stage button — primary if passed */}
            {onNextStage && passed && (
              <button
                onClick={onNextStage}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:from-emerald-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                ➡️ Keyingi Bosqichga O&apos;tish
              </button>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={onRetry}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
              >
                🔄 Qayta Mashq
              </button>
              <button
                onClick={onDashboard}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                🗺 Bosh Sahifa
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
