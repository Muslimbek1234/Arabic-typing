'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AIChatPanel from './AIChatPanel';
import GuideModal from './GuideModal';

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-slate-900/80 bg-[#050508]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          {/* Logo and Back button */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-white transition-all"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-indigo-900/30 shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all group-hover:border-blue-500/50">
                <span className="arabic-text text-xl font-bold text-blue-400">ع</span>
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  Arabcha Yozish AI
                </h2>
                <p className="hidden md:block text-[10px] text-slate-500">
                  Vaqtni belgilang. Qiyinchilik avtomatik moslashadi.
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-all hover:bg-slate-900/40 cursor-pointer"
            >
              ℹ️ Yo&apos;riqnoma
            </button>
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-all hover:bg-slate-900/40"
            >
              Bosh sahifa
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-600/5 px-3.5 py-1.5 text-xs font-semibold text-blue-400 hover:border-blue-500/40 hover:bg-blue-600/10 transition-all"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer"
            >
              🤖 AI Yordamchi
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Sliding Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Interactive touch typing guide modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
