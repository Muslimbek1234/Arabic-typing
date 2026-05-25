'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { getHistory, clearHistory, SessionRecord, resetProgress } from '../../lib/storage';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Next.js Hydration safety check
  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Haqiqatan ham barcha urinishlar tarixini o'chirib tashlamoqchimisiz? (Mahorat va qulflangan darajalar saqlanib qoladi)")) {
      clearHistory();
      setHistory([]);
      setAiReport('');
    }
  };

  const handleFullReset = () => {
    resetProgress();
    setHistory([]);
    setAiReport('');
    setShowResetConfirm(false);
    window.location.reload();
  };

  const handleGetAIReport = async () => {
    if (history.length === 0 || aiLoading) return;
    setAiLoading(true);
    setAiReport('');

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history }),
      });

      const data = await response.json();
      setAiReport(data.feedback || "AI tahlil hisobotini yuklab bo'lmadi.");
    } catch (error) {
      console.error('Failed to load AI progress report:', error);
      setAiReport("Kechirasiz, sun'iy intellekt tahlilini yuklashda xatolik yuz berdi. Iltimos, internetingizni tekshirib, qaytadan urinib ko'ring.");
    } finally {
      setAiLoading(false);
    }
  };

  // Hydration fallback
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Calculate statistics
  const totalSessions = history.length;
  const avgWpm = totalSessions > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.wpm, 0) / totalSessions) 
    : 0;
  const avgAccuracy = totalSessions > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / totalSessions) 
    : 0;
  const bestWpm = totalSessions > 0 
    ? Math.max(...history.map(item => item.wpm)) 
    : 0;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Noma\'lum';
    }
  };

  const getLevelLabel = (level: number, stage?: number, isTest?: boolean) => {
    if (level === 1) {
      if (isTest) return 'Exit Test (L1)';
      return `Harflar (Stage ${stage || 1})`;
    }
    if (level === 2) return `So'zlar (Stage ${stage || 1})`;
    return `Matnlar (Stage ${stage || 1})`;
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 relative z-10">
        {/* Top heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Natijalar Paneli (Dashboard)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Yozish ko&apos;rsatkichlaringiz, o&apos;sish tahlili va shaxsiy AI Coach xulosalari.
            </p>
          </div>

          {totalSessions > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleClearHistory}
                className="text-xs font-semibold text-slate-400 border border-slate-800/80 bg-slate-900/30 px-3 py-2 rounded-xl hover:bg-slate-900/60 hover:text-white transition-all duration-200"
              >
                🗑 Tarixni tozalash
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/5 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-200"
              >
                🔄 To'liq Reset
              </button>
            </div>
          )}
        </div>

        {/* Reset Confirmation box */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 border border-red-500/20 bg-red-500/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="text-sm text-red-300 font-semibold">
                ⚠️ Diqqat! Barcha progresslar (harflar qulfi, tarixingiz) butunlay o'chib ketadi! Davom etasizmi?
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={handleFullReset}
                  className="bg-red-600 hover:bg-red-500 px-3.5 py-1.5 rounded-xl text-xs text-white font-bold transition-all"
                >
                  Ha, reset qilinsin
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="border border-slate-800 bg-slate-900/50 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-400 transition-all"
                >
                  Bekor qilish
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {totalSessions === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glow-card p-12 text-center max-w-lg mx-auto bg-gradient-to-br from-slate-900/10 to-blue-950/5 border-slate-900/50 mt-12"
          >
            <div className="text-5xl mb-4">⌨️</div>
            <h3 className="text-xl font-bold text-white mb-2">Hali mashq qilmagansiz</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Darslarni boshlab birinchi mashqingizni yakunlang, shundan so'ng bu yerda barcha statistikangiz va AI rivojlanish hisoboti ko'rsatiladi.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              🚀 Birinchi Mashqni Boshlash
            </Link>
          </motion.div>
        ) : (
          /* Dashboard content */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Stats Cards Row */}
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-4 grid-cols-2">
              {/* Total Sessions */}
              <div className="glow-card p-5 bg-gradient-to-br from-blue-600/5 to-blue-900/5 border-blue-500/10">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1">
                  Mashqlar
                </span>
                <span className="text-3xl font-extrabold text-white">{totalSessions}</span>
                <span className="text-xs text-slate-500 block mt-1">jami urinish</span>
              </div>

              {/* Best WPM */}
              <div className="glow-card p-5 bg-gradient-to-br from-cyan-600/5 to-cyan-900/5 border-cyan-500/10">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                  Eng yuqori
                </span>
                <span className="text-3xl font-extrabold text-white">{bestWpm}</span>
                <span className="text-xs text-slate-500 block mt-1">maksimal WPM</span>
              </div>

              {/* Average WPM */}
              <div className="glow-card p-5 bg-gradient-to-br from-indigo-600/5 to-indigo-900/5 border-indigo-500/10">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1">
                  O&apos;rtacha tezlik
                </span>
                <span className="text-3xl font-extrabold text-white">{avgWpm}</span>
                <span className="text-xs text-slate-500 block mt-1">WPM</span>
              </div>

              {/* Average Accuracy */}
              <div className="glow-card p-5 bg-gradient-to-br from-emerald-600/5 to-emerald-900/5 border-emerald-500/10">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                  O&apos;rtacha aniqlik
                </span>
                <span className="text-3xl font-extrabold text-white">{avgAccuracy}%</span>
                <span className="text-xs text-slate-500 block mt-1">foiz</span>
              </div>
            </motion.div>

            {/* 🧠 DYNAMIC AI PROGRESS REPORT SECTION */}
            <motion.div variants={itemVariants} className="glow-card p-6 bg-gradient-to-r from-blue-950/10 to-indigo-950/15 border-blue-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Sun&apos;iy Intellektning Rivojlanish Tahlili</h3>
                    <p className="text-xs text-slate-500">Butun mashqlar tarixingiz asosida shaxsiy o'sish dinamikangiz sharhi.</p>
                  </div>
                </div>

                <button
                  onClick={handleGetAIReport}
                  disabled={aiLoading}
                  className={`rounded-xl px-5 py-2.5 text-xs font-black text-white transition-all select-none ${
                    aiLoading
                      ? 'bg-blue-600/35 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/15'
                  }`}
                >
                  {aiLoading ? '🔄 AI tahlil qilmoqda...' : '🧠 Tahlilni shakllantirish'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {aiReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-t border-slate-900/60 pt-4"
                  >
                    <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {aiReport}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Session History Table */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⏱</span> Oxirgi mashqlar tarixi
              </h2>

              <div className="space-y-2.5">
                {history.map((record, index) => (
                  <motion.div
                    key={record.id || index}
                    whileHover={{ x: 4, backgroundColor: 'rgba(30, 41, 59, 0.15)' }}
                    className="glow-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20 border-slate-900/50 transition-all duration-200"
                  >
                    {/* Level name & Date */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-xs font-bold text-blue-400">
                          L{record.level}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">
                          {getLevelLabel(record.level, record.stage, record.isTest)}
                        </h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {formatDate(record.date)}
                        </span>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="flex items-center justify-between sm:justify-start gap-8 border-t border-slate-900/40 md:border-none pt-3 md:pt-0">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                          WPM (Tezlik)
                        </span>
                        <span className="font-extrabold text-cyan-400 text-sm sm:text-base">{record.wpm}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                          Aniqlik
                        </span>
                        <span className="font-extrabold text-emerald-400 text-sm sm:text-base">{record.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                          Xatolar
                        </span>
                        <span className="font-extrabold text-rose-500 text-sm sm:text-base">{record.errors}</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                          Davomiyligi
                        </span>
                        <span className="font-medium text-slate-300 text-xs sm:text-sm">{record.duration}s</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
