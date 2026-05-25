'use client';

import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  activeKey: string;
  nextChar?: string;
}

export default function VirtualKeyboard({ activeKey, nextChar }: VirtualKeyboardProps) {
  // Arabic keyboard layout rows (Standard Clavier Layout)
  const rows = [
    ['د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض'],
    ['ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش'],
    ['ظ', 'ز', 'و', 'ة', 'ى', 'ر', 'ؤ', 'ء', 'ئ'],
  ];

  // Helper to determine if a key is currently active
  const isKeyActive = (key: string) => {
    if (!activeKey) return false;
    
    // Normalize spaces
    if (key === ' ' && (activeKey === ' ' || activeKey === 'Spacebar')) {
      return true;
    }
    
    return activeKey.toLowerCase() === key.toLowerCase();
  };

  // Helper to determine if a key is expecting
  const isKeyExpecting = (key: string) => {
    if (!nextChar) return false;
    
    // Normalize spaces
    if (key === ' ' && nextChar === ' ') {
      return true;
    }
    
    return nextChar.toLowerCase() === key.toLowerCase();
  };

  return (
    <div className="glow-card p-4 sm:p-6 bg-slate-950/20 border-slate-900/60 max-w-3xl mx-auto mt-6">
      <div className="flex flex-col gap-2 md:gap-2.5 items-center">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 sm:gap-1.5 md:gap-2 justify-center w-full">
            {row.map((char) => {
              const active = isKeyActive(char);
              const expecting = isKeyExpecting(char);
              return (
                <motion.div
                  key={char}
                  animate={active ? { scale: 0.93, y: 1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className={`flex items-center justify-center rounded-lg sm:rounded-xl font-arabic text-xs sm:text-lg font-bold border transition-all select-none duration-150
                    w-7 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12
                    ${
                      active
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)] key-highlight'
                        : expecting
                        ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] key-expecting'
                        : 'border-slate-800/80 bg-slate-900/30 text-slate-450 hover:border-slate-700/60 hover:text-slate-200'
                    }`}
                >
                  {char}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Spacebar Row */}
        <div className="flex gap-2 justify-center w-full mt-1">
          <motion.div
            animate={isKeyActive(' ') ? { scale: 0.97, y: 1 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className={`flex items-center justify-center h-10 sm:h-11 md:h-12 rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider border transition-all select-none duration-150
              w-44 sm:w-80 md:w-[420px]
              ${
                isKeyActive(' ')
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)] key-highlight'
                  : isKeyExpecting(' ')
                  ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] key-expecting'
                  : 'border-slate-800/80 bg-slate-900/30 text-slate-500 hover:border-slate-700/60 hover:text-slate-350'
              }`}
          >
            Bo&apos;sh joy (probel) ␣
          </motion.div>
        </div>
      </div>
    </div>
  );
}
