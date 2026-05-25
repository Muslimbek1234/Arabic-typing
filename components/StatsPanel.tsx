'use client';

import { motion } from 'framer-motion';

interface StatsPanelProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeLeft: number;
  skillLevel: number;
  combo?: number;
  xp?: number;
  rank?: { name: string; emoji: string; color: string };
}

export default function StatsPanel({
  wpm,
  accuracy,
  errors,
  timeLeft,
  skillLevel,
  combo = 0,
  xp = 0,
  rank,
}: StatsPanelProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 10;
  const comboMultiplier = combo >= 30 ? 5 : combo >= 15 ? 3 : combo >= 5 ? 2 : 1;

  return (
    <div className="space-y-3 mb-6">
      {/* Main stats grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {/* 1. Speed (WPM) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glow-card p-4 bg-gradient-to-br from-cyan-600/5 to-cyan-900/5 border-cyan-500/10"
        >
          <span className="text-[10px] uppercase tracking-wider text-cyan-400/80 font-bold block mb-1">
            Tezlik (WPM)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{wpm}</span>
            <span className="text-xs text-slate-500 font-medium">so&apos;z/daq</span>
          </div>
        </motion.div>

        {/* 2. Accuracy (%) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glow-card p-4 bg-gradient-to-br from-emerald-600/5 to-emerald-900/5 border-emerald-500/10"
        >
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-bold block mb-1">
            Aniqlik
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{accuracy}</span>
            <span className="text-xs text-emerald-400/60 font-semibold">%</span>
          </div>
        </motion.div>

        {/* 3. Errors */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`glow-card p-4 bg-gradient-to-br border-rose-500/10 ${
            errors > 0 
              ? 'from-rose-600/10 to-rose-900/10 shake-error' 
              : 'from-rose-600/5 to-rose-900/5'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-rose-400/80 font-bold block mb-1">
            Xatolar
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{errors}</span>
            <span className="text-xs text-slate-500 font-medium">ta</span>
          </div>
        </motion.div>

        {/* 4. Time Left */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`glow-card p-4 bg-gradient-to-br ${
            isLowTime
              ? 'from-red-600/10 to-red-950/20 border-red-500/30 animate-pulse'
              : 'from-violet-600/5 to-violet-900/5 border-violet-500/10'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold block mb-1 ${
              isLowTime ? 'text-red-400' : 'text-violet-400/80'
            }`}
          >
            Qolgan Vaqt
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold ${isLowTime ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* XP / Combo / Rank bar */}
      <div className="glow-card px-5 py-3 bg-slate-900/10 border-slate-800/45 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Rank and Level */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 font-bold uppercase text-[9px]">
            LVL {skillLevel}
          </span>
          {rank && (
            <span className={`flex items-center gap-1 text-xs font-bold ${rank.color}`}>
              <span>{rank.emoji}</span>
              <span>{rank.name}</span>
            </span>
          )}
        </div>

        {/* Center: XP indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider">XP</span>
            <span className="text-sm font-extrabold text-white">{xp}</span>
          </div>

          {/* Combo badge */}
          {combo >= 5 && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 px-2.5 py-0.5"
            >
              <span className="text-[10px] font-black text-orange-400">🔥 {combo}</span>
              {comboMultiplier > 1 && (
                <span className="text-[9px] font-black text-yellow-400">×{comboMultiplier}</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Right: Skill progress bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[150px]">
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900/80 relative">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 progress-fill"
              style={{ width: `${(skillLevel / 10) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-slate-500 font-semibold text-xs">{skillLevel}/10</span>
        </div>
      </div>
    </div>
  );
}
