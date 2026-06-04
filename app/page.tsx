'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { getProgressState, ProgressState, resetProgress, TOTAL_LETTER_STAGES, EXIT_TEST_STAGE, TOTAL_ALL_STAGES } from '../lib/storage';
import { ARABIC_LETTERS } from '../lib/text-generator';
import GuideModal from '../components/GuideModal';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressState>({ unlockedLevel: 1, unlockedStage: 1 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const currentProgress = getProgressState();
    // Foydalanuvchi 18 tezlik (WPM) qilib bo'lgan bo'lsa, Level 2 ochiladi.
    // Biz storage-dan foydalanuvchining barcha sessiyalarini tekshiramiz:
    // agar Level 1 (exit test yoki darslar) bo'yicha kamida bitta seansda 18+ WPM bo'lgan bo'lsa
    // va hozir Level 1 da qolib ketgan bo'lsa, 2-bosqichni ochamiz (Level 2, Stage 1).
    // Shuningdek, foydalanuvchi talabiga ko'ra hozir to'g'ridan-to'g'ri Level 2 ni ochib qo'yamiz.
    if (currentProgress.unlockedLevel === 1) {
      const nextState = { unlockedLevel: 2, unlockedStage: 1 };
      localStorage.setItem('arabic_typing_progress_v3', JSON.stringify(nextState));
      setProgress(nextState);
    } else {
      setProgress(currentProgress);
    }
  }, []);

  const handleReset = () => {
    resetProgress();
    setProgress({ unlockedLevel: 1, unlockedStage: 1 });
    setShowResetConfirm(false);
    window.location.reload();
  };

  // Check locking conditions
  const isStageUnlocked = (level: number, stage: number) => {
    if (level < progress.unlockedLevel) return true;
    if (level > progress.unlockedLevel) return false;
    return stage <= progress.unlockedStage;
  };

  // Progress Calculation (Total TOTAL_ALL_STAGES stages: 33 in L1, 3 in L2, 3 in L3)
  const calculateTotalProgress = () => {
    let completed = 0;
    const l1Stages = EXIT_TEST_STAGE; // 33 (32 letters + exit test)
    if (progress.unlockedLevel === 1) {
      completed = progress.unlockedStage - 1;
    } else if (progress.unlockedLevel === 2) {
      completed = l1Stages + (progress.unlockedStage - 1);
    } else if (progress.unlockedLevel === 3) {
      completed = l1Stages + 3 + (progress.unlockedStage - 1);
    }
    return {
      completed,
      total: TOTAL_ALL_STAGES,
      percent: Math.min(100, Math.round((completed / TOTAL_ALL_STAGES) * 100)),
    };
  };

  const progressStats = calculateTotalProgress();

  const faqItems = [
    {
      q: "At-Tanal imtihoni nima va undan qanday o'tish mumkin?",
      a: "At-Tanal (التنال العربي) — xalqaro arab tili yozish sertifikati imtihoni. Writing bo'limida arab tilida tez (kamida 30-40 WPM) va to'g'ri (kamida 90-95% aniqlik) yozish talab etiladi. Ushbu platforma sizni aynan shu ko'rsatkichlarga yetishishga tayyorlaydi.",
    },
    {
      q: "At-Tanal Writing imtihonida qanday ko'rsatkichlar talab etiladi?",
      a: "At-Tanal Writing bo'limida:\n• Tezlik: Kamida 30-40 WPM (so'z/daqiqa)\n• Aniqlik: Kamida 90-95%\n• Klaviaturaga qaramasdan yozish (blind typing)\n• Barcha 28+ arab harflarini erkin yozish\nBizning tizimimiz har bir ko'rsatkichni alohida mashq qilish imkonini beradi.",
    },
    {
      q: "Harflar nima uchun klaviatura tartibida joylashgan?",
      a: "Harflar alifbo tartibida emas, balki arab klaviaturasi (standard Arabic keyboard layout) tartibida joylashgan. Bu strategik qaror — chunki At-Tanal imtihonida siz haqiqiy klaviaturada yozasiz. Klaviatura tartibida o'rganish mushak xotirasini (muscle memory) tezroq shakllantiradi.",
    },
    {
      q: "Qiziqarli o'yin tovushlari va effektlar qanday ishlaydi?",
      a: "To'g'ri bosganingizda satisfying chertish ovozi va olovli Combo/Streak 🔥 ko'tariladi, xato bosganda esa ogohlantiruvchi buzz ovozi chalinadi. Combo orqali XP ko'paytirgich (2x, 3x, 5x) yig'asiz. Bu o'quvchini yanada ko'proq jalb qiladi va yozish tezligini oshiradi.",
    },
    {
      q: "AI Coach tahlilni qanday olaman?",
      a: "Dashboard sahifasiga o'tib, 'Tahlilni shakllantirish' tugmasini bossangiz, OpenAI sun'iy intellekti sizning barcha urinishlar tarixingizni o'rganib chiqib, At-Tanal sertifikatini olish uchun shaxsiy maslahat va metodik tavsiyalarni shakllantiradi.",
    },
    {
      q: "Xato qilsam va backspace bilan to'g'rilasam nima bo'ladi?",
      a: "Backspace bilan xatoni o'chirib, to'g'ri harfni qayta yozsangiz ham, xato hisoblanadi. Bu At-Tanal imtihonidagi real sharoitga tayyorlash uchun — imtihonda har bir xato qaytarib bo'lmas. Shuning uchun aniqlikka alohida e'tibor bering!",
    },
  ];

  return (
    <>
      <Header />
      <main className="relative flex-1 bg-grid pb-20">
        {/* Ambient background orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
          <div className="absolute -bottom-60 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.03] blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
          {/* ═══════════════════ TOP HERO SECTION ═══════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 mb-8"
          >
            {/* Glowing At-Tanal Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 tanal-badge px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-blue-400 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse">
              <span>التنال العربي</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>At-Tanal Writing Prep</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
              At-Tanal Writing Mastery Academy
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Xalqaro arab tili sertifikati imtihoni yozish bo&apos;limiga mukammal tayyorlanish platformasi. Dinamik ta&apos;lim yo&apos;li, satisfying o&apos;yin effektlari va OpenAI Coach yordamida o&apos;rganing.
            </p>

            {/* At-Tanal Target metrics */}
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
                <span className="text-[10px] text-emerald-400 font-bold">🎯 Maqsad:</span>
                <span className="text-[10px] text-white font-bold">30+ WPM</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5">
                <span className="text-[10px] text-cyan-400 font-bold">🎯 Aniqlik:</span>
                <span className="text-[10px] text-white font-bold">90%+</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
                <span className="text-[10px] text-violet-400 font-bold">📋 Harflar:</span>
                <span className="text-[10px] text-white font-bold">{TOTAL_LETTER_STAGES} ta</span>
              </div>
            </div>

            {/* Yo'riqnoma button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.08)] transition-all cursor-pointer select-none"
              >
                ℹ️ Qanday yoziladi? (Interaktiv Yo&apos;riqnoma)
              </button>
            </div>

            {/* Course Progress Dashboard */}
            <div className="mt-6 max-w-lg mx-auto glow-card p-4 bg-gradient-to-r from-blue-950/10 to-indigo-950/10 border-blue-500/10">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>Imtihon tayyorgarligi progressi: {progressStats.percent}%</span>
                <span>{progressStats.completed} / {progressStats.total} Bosqich</span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-900/60 relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 progress-fill"
                  style={{ width: `${progressStats.percent}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════ LEVEL MAP ═══════════════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* LEVEL 1: HARFLAR */}
            <motion.div variants={itemVariants} className="glow-card p-6 bg-slate-950/10 border-slate-900/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900/60 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <span className="font-bold text-blue-400 text-lg">أ</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">1-Daraja: Harflar darsligi (الحروف)</h3>
                    <p className="text-xs text-slate-500">Arab klaviaturasi tartibida harflarni bosqichma-bosqich o&apos;rganish. Har bir darsda yangi harf + avvalgilarni takrorlash.</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 px-3 py-1 text-xs font-bold self-start md:self-auto">
                  {Math.min(TOTAL_LETTER_STAGES, progress.unlockedLevel > 1 ? TOTAL_LETTER_STAGES : progress.unlockedStage)} / {TOTAL_LETTER_STAGES} dars ochilgan
                </span>
              </div>

              {/* Keyboard layout label */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] text-blue-400/60 font-bold uppercase tracking-wider">⌨ Arab klaviatura tartibi</span>
              </div>

              {/* Grid of letters (32 sub-levels) — keyboard layout order */}
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-11 gap-2 mb-6">
                {ARABIC_LETTERS.map((char, index) => {
                  const stageNum = index + 1;
                  const unlocked = isStageUnlocked(1, stageNum);
                  const active = progress.unlockedLevel === 1 && progress.unlockedStage === stageNum;
                  
                  return (
                    <Link
                      key={`${char}-${index}`}
                      href={unlocked ? `/practice?level=1&stage=${stageNum}` : '#'}
                      className={`relative flex flex-col items-center justify-center h-14 rounded-xl border select-none letter-card-hover ${
                        active
                          ? 'border-blue-500 bg-blue-600/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)] animate-pulse'
                          : unlocked
                          ? 'border-slate-800/80 bg-slate-900/10 text-slate-300 hover:border-blue-500/40 hover:bg-slate-900/40 hover:text-white'
                          : 'border-slate-950 bg-slate-950/40 text-slate-700 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="arabic-text text-lg font-bold">{char}</span>
                      <span className="text-[9px] text-slate-500 font-semibold mt-0.5">{stageNum}-dars</span>
                      {!unlocked && <span className="absolute top-1 right-1 text-[8px]">🔒</span>}
                      {unlocked && !active && (progress.unlockedLevel > 1 || progress.unlockedStage > stageNum) && (
                        <span className="absolute top-1 right-1 text-[8px] text-emerald-400 font-bold">✓</span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Exit test badge */}
              <div className="border-t border-slate-900/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    🎓 At-Tanal Level 1 Exit Test (Nazorat Testi)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">So&apos;zlar simulyatorini ochish va sertifikat talabini tekshirish uchun ushbu nazorat testidan o&apos;ting.</p>
                </div>
                <Link
                  href={isStageUnlocked(1, EXIT_TEST_STAGE) ? `/practice?level=1&stage=${EXIT_TEST_STAGE}` : '#'}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-200 select-none ${
                    isStageUnlocked(1, EXIT_TEST_STAGE)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500'
                      : 'bg-slate-950/60 border border-slate-900 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isStageUnlocked(1, EXIT_TEST_STAGE) ? '🔓 Testni Boshlash' : '🔒 Qulflangan'}
                </Link>
              </div>
            </motion.div>

            {/* LEVEL 2: SO'ZLAR */}
            <motion.div 
              variants={itemVariants} 
              className={`glow-card p-6 bg-slate-950/10 relative overflow-hidden ${
                progress.unlockedLevel < 2 ? 'border-slate-950/80 opacity-60' : 'border-slate-900/40'
              }`}
            >
              {progress.unlockedLevel < 2 && (
                <div className="absolute inset-0 z-20 bg-[#050508]/65 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-4">
                  <span className="text-3xl mb-2">🔒</span>
                  <h4 className="font-bold text-white text-sm">2-Daraja qulflangan</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Uni ochish uchun 1-darajaning barcha harflarini o&apos;rganib, nazorat testini topshiring!
                  </p>
                  <button
                    onClick={() => {
                      const nextState = { unlockedLevel: 2, unlockedStage: 1 };
                      localStorage.setItem('arabic_typing_progress_v3', JSON.stringify(nextState));
                      setProgress(nextState);
                      window.location.reload();
                    }}
                    className="mt-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 px-3 py-1.5 text-[11px] font-bold text-blue-300 transition-all cursor-pointer"
                  >
                    🔓 2-Darajani qo&apos;lda ochish
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900/60 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="font-bold text-indigo-400 text-lg">كلم</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">2-Daraja: So&apos;zlar simulyatori (الكلمات)</h3>
                    <p className="text-xs text-slate-500">So&apos;z bo&apos;g&apos;inlari orqali yozish tezligi va aniqlik dinamikasini mashq qilish darslari.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { stage: 1, title: 'Oson so\'zlar', desc: 'At-Tanal A2 darajasiga mos bo\'lgan qisqa arabcha so\'zlar.' },
                  { stage: 2, title: 'O\'rtacha so\'zlar', desc: 'At-Tanal B1 darajasiga mos o\'rta murakkablikdagi so\'zlar.' },
                  { stage: 3, title: 'Qiyin so\'zlar', desc: 'At-Tanal B2 darajasiga mos murakkab bo\'g\'inli arabcha so\'zlar.' },
                ].map((item) => {
                  const unlocked = isStageUnlocked(2, item.stage);
                  const active = progress.unlockedLevel === 2 && progress.unlockedStage === item.stage;

                  return (
                    <Link
                      key={item.stage}
                      href={unlocked ? `/practice?level=2&stage=${item.stage}` : '#'}
                      className={`glow-card p-5 flex flex-col justify-between min-h-[120px] transition-all duration-200 select-none ${
                        active
                          ? 'border-indigo-500 bg-indigo-950/15 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : unlocked
                          ? 'border-slate-800/80 bg-slate-900/10 hover:border-indigo-500/40 hover:bg-slate-900/30'
                          : 'border-slate-950 bg-slate-950/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 text-[9px] font-bold">
                            Stage {item.stage}
                          </span>
                          {!unlocked && <span className="text-[10px]">🔒</span>}
                          {unlocked && !active && (progress.unlockedLevel > 2 || progress.unlockedStage > item.stage) && (
                            <span className="text-emerald-400 font-bold text-[10px]">✓ Bajarildi</span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>

                      {unlocked && (
                        <span className="text-indigo-400 text-xs font-semibold mt-4 block self-start hover:text-indigo-300 transition-colors">
                          Boshlash →
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* LEVEL 3: MATNLAR */}
            <motion.div 
              variants={itemVariants} 
              className={`glow-card p-6 bg-slate-950/10 relative overflow-hidden ${
                progress.unlockedLevel < 3 ? 'border-slate-950/80 opacity-60' : 'border-slate-900/40'
              }`}
            >
              {progress.unlockedLevel < 3 && (
                <div className="absolute inset-0 z-20 bg-[#050508]/65 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-4">
                  <span className="text-3xl mb-2">🔒</span>
                  <h4 className="font-bold text-white text-sm">3-Daraja qulflangan</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Uni ochish uchun 2-darajaning barcha so&apos;zli darslarini muvaffaqiyatli topshiring!
                  </p>
                  <button
                    onClick={() => {
                      const nextState = { unlockedLevel: 3, unlockedStage: 1 };
                      localStorage.setItem('arabic_typing_progress_v3', JSON.stringify(nextState));
                      setProgress(nextState);
                      window.location.reload();
                    }}
                    className="mt-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 px-3 py-1.5 text-[11px] font-bold text-indigo-300 transition-all cursor-pointer"
                  >
                    🔓 3-Darajani qo&apos;lda ochish
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900/60 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <span className="font-bold text-violet-400 text-lg">نص</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">3-Daraja: At-Tanal Imtihon Matnlari (النصوص)</h3>
                    <p className="text-xs text-slate-500">Haqiqiy At-Tanal yozish (writing) imtihon ko&apos;rsatkichlariga mos matn va paragraflar simulyatori.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { stage: 1, title: 'Qisqa iboralar', desc: 'Ko\'p qo\'llaniladigan oson hikmatlar va At-Tanal iboralar mashqi.' },
                  { stage: 2, title: 'To\'liq gaplar', desc: 'At-Tanal B2/C1 darajasiga mos to\'liq murakkab grammatik gaplar.' },
                  { stage: 3, title: 'Katta matnlar', desc: 'At-Tanal writing sertifikati imtihoni matnlari simulyatori.' },
                ].map((item) => {
                  const unlocked = isStageUnlocked(3, item.stage);
                  const active = progress.unlockedLevel === 3 && progress.unlockedStage === item.stage;

                  return (
                    <Link
                      key={item.stage}
                      href={unlocked ? `/practice?level=3&stage=${item.stage}` : '#'}
                      className={`glow-card p-5 flex flex-col justify-between min-h-[120px] transition-all duration-200 select-none ${
                        active
                          ? 'border-violet-500 bg-violet-950/15 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                          : unlocked
                          ? 'border-slate-800/80 bg-slate-900/10 hover:border-violet-500/40 hover:bg-slate-900/30'
                          : 'border-slate-950 bg-slate-950/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-0.5 text-[9px] font-bold">
                            Stage {item.stage}
                          </span>
                          {!unlocked && <span className="text-[10px]">🔒</span>}
                          {unlocked && !active && (progress.unlockedLevel > 3 && progress.unlockedStage > item.stage) && (
                            <span className="text-emerald-400 font-bold text-[10px]">✓ Bajarildi</span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>

                      {unlocked && (
                        <span className="text-violet-400 text-xs font-semibold mt-4 block self-start hover:text-violet-300 transition-colors">
                          Boshlash →
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
          <div className="mt-16 max-w-2xl mx-auto space-y-4">
            <h3 className="text-lg font-bold text-center text-white mb-6">💡 At-Tanal imtihoniga tayyorgarlik yo&apos;llanmalari</h3>
            {faqItems.map((item, idx) => (
              <div key={idx} className="glow-card border-slate-900 bg-slate-950/20">
                <button
                  onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-200 focus:outline-none"
                >
                  <span>{item.q}</span>
                  <svg
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${faqOpenIdx === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {faqOpenIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-900/60"
                    >
                      <p className="px-5 py-4 text-xs leading-relaxed text-slate-400 whitespace-pre-line">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Reset progress */}
          <div className="mt-12 text-center">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold"
              >
                🔄 Progressni butunlay tozalash (Reset)
              </button>
            ) : (
              <div className="inline-flex flex-col items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                <span className="text-xs text-red-300 font-semibold">
                  Haqiqatan ham barcha ta&apos;lim taraqqiyoti va tarixingizni o&apos;chirib tashlamoqchimisiz?
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs text-white font-bold"
                  >
                    Ha, tozalansin
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="border border-slate-800 bg-slate-900/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating touch typing guide modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
