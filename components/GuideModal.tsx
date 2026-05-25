'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'fingers' | 'rules' | 'tips'>('basics');

  const tabs = [
    { id: 'basics' as const, label: 'ℹ️ Asosiy Qoidalar', icon: '📖' },
    { id: 'fingers' as const, label: '⌨️ Barmoqlar', icon: '👐' },
    { id: 'rules' as const, label: '🎯 At-Tanal Talabi', icon: '🏆' },
    { id: 'tips' as const, label: '💡 AI Maslahatlari', icon: '🧠' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {/* Dark overlay backdrop */}
          <div className="absolute inset-0 bg-black/75 cursor-pointer" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#07070c] p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              boxShadow: '0 0 50px rgba(37, 99, 235, 0.2), 0 0 100px rgba(99, 102, 241, 0.05)',
            }}
          >
            {/* Background design elements */}
            <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-blue-600/5 blur-[50px] pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-indigo-600/5 blur-[50px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  📚
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base md:text-lg">
                    Arabcha Touch-Typing Yo&apos;riqnomasi
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Klaviatura tartibi, maqsadlar va tezkor o&apos;rganish qo&apos;llanmasi.
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-950/80 text-slate-500 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-900/60 pb-2 mb-6 overflow-x-auto gap-1 scrollbar-none shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all shrink-0 select-none ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Contents (Scrollable if overflow) */}
            <div className="flex-1 overflow-y-auto pr-1 text-slate-300 space-y-4 text-xs md:text-sm leading-relaxed">
              <AnimatePresence mode="wait">
                {activeTab === 'basics' && (
                  <motion.div
                    key="basics"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="glow-card border-blue-500/10 bg-blue-500/5 p-4 rounded-xl">
                      <h4 className="font-bold text-blue-400 mb-1 text-sm flex items-center gap-1.5">
                        ⌨️ Arab Klaviatura Tartibi (Standard Layout)
                      </h4>
                      <p>
                        Bizning darsligimiz arab tilidagi harflarni alifbo tartibida emas, balki **arab klaviaturasi (Standard Arabic Keyboard)** tartibida o&apos;rgatadi. Bu sizga kompyuterda klaviaturaga qaramasdan (blind typing) tez va to&apos;g&apos;ri yozish ko&apos;nikmasini juda tez shakllantirish imkonini beradi.
                      </p>
                    </div>

                    <div className="glow-card border-violet-500/10 bg-violet-500/5 p-4 rounded-xl">
                      <h4 className="font-bold text-violet-400 mb-1 text-sm flex items-center gap-1.5">
                        ␣ Bo&apos;sh Joy (Probel) Belgisi nimani anglatadi?
                      </h4>
                      <p>
                        Yozish mashqlarida probel tashlash kerak bo&apos;lgan joylar <span className="inline-flex items-center justify-center font-sans text-xs px-1.5 py-0.5 mx-1 min-w-[20px] rounded border border-blue-500/30 bg-blue-500/10 text-blue-400">␣</span> ochiq quticha belgisi shaklida visual ko&apos;rsatiladi.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Agar ushbu quticha ko&apos;k rangda bo&apos;lsa (<span className="px-1 bg-blue-500/25 border border-blue-500/50 rounded text-blue-300 font-sans">␣</span>) — hozir probel tugmasini bosishingiz kerak!</li>
                        <li>To&apos;g&apos;ri bosilganda u yashil (<span className="px-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 font-sans">␣</span>), xato bo&apos;lganda esa qizil (<span className="px-1 bg-rose-500/20 border border-rose-500/30 rounded text-rose-500 font-sans">␣</span>) rangga kiradi.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'fingers' && (
                  <motion.div
                    key="fingers"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="glow-card border-slate-900 bg-slate-950/20 p-4 rounded-xl">
                      <h4 className="font-bold text-white mb-2 text-sm">👐 Uy Qatori (Home Row) Joylashuvi</h4>
                      <p className="mb-3">
                        Barmoqlaringizni klaviaturaning o&apos;rta qatoriga quyidagicha joylashtiring:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-2.5">
                          <span className="font-bold text-blue-400 block mb-1">🫲 Chap Qo&apos;l Barmoqlari:</span>
                          • Jimjiloq: <span className="font-bold text-white">ش</span> (Sh)<br />
                          • Nomsiz: <span className="font-bold text-white">س</span> (S)<br />
                          • O&apos;rta: <span className="font-bold text-white">ي</span> (Y)<br />
                          • Ko&apos;rsatkich: <span className="font-bold text-white">ب</span> (B)
                        </div>
                        <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-2.5">
                          <span className="font-bold text-cyan-400 block mb-1">🫱 O&apos;ng Qo&apos;l Barmoqlari:</span>
                          • Ko&apos;rsatkich: <span className="font-bold text-white">ت</span> (T)<br />
                          • O&apos;rta: <span className="font-bold text-white">ن</span> (N)<br />
                          • Nomsiz: <span className="font-bold text-white">م</span> (M)<br />
                          • Jimjiloq: <span className="font-bold text-white">ك</span> (K)
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        💡 Bosh barmoqlar (thumbs) har doim **Probel (Space)** tugmasini bosish uchun mas&apos;uldir.
                      </p>
                    </div>

                    <div className="glow-card border-blue-500/10 bg-blue-500/5 p-4 rounded-xl">
                      <h4 className="font-bold text-blue-400 mb-1 text-sm flex items-center gap-1">
                        🌟 Virtual Klaviaturadagi Ko&apos;rsatkich Chiroqlari
                      </h4>
                      <p>
                        Mashq qilish jarayonida adashib ketmasligingiz uchun virtual klaviaturada **navbatdagi bosishingiz kerak bo&apos;lgan tugma** ajoyib binafsha-moviy rangli pulsatsiya (glow) bilan yonib-o&apos;chib turadi. Faqat o&apos;sha chiroqqa qarab yozing, bu yozishni oson va qiziqarli qiladi!
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'rules' && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="glow-card border-emerald-500/10 bg-emerald-500/5 p-4 rounded-xl">
                      <h4 className="font-bold text-emerald-400 mb-1 text-sm">🏆 At-Tanal Sertifikat Talablari</h4>
                      <p>
                        At-Tanal (التنال العربي) — arab tilidan xalqaro professional sertifikat bo&apos;lib, uning Writing qismida klaviaturaga qaramasdan (touch typing) arabchada quyidagi minimal talablar bilan yozish so&apos;raladi:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>**Tezlik:** Kamida **30-40 WPM** (Word Per Minute - so&apos;z/daqiqa)</li>
                        <li>**Aniqlik (Accuracy):** Kamida **90% - 95%** to&apos;g&apos;ri yozilgan belgilar</li>
                      </ul>
                    </div>

                    <div className="glow-card border-rose-500/10 bg-rose-500/5 p-4 rounded-xl">
                      <h4 className="font-bold text-rose-400 mb-1 text-sm">⚠️ Backspace (Xatoni O&apos;chirish) Qoidasi</h4>
                      <p>
                        At-Tanal imtihon standartlariga to&apos;liq moslashishingiz uchun tizimimizda xato yozilgan harfni o&apos;chirib to&apos;g&apos;rilasangiz ham u **xato** hisoblanib qolaveradi! Bu sizning e&apos;tiboringizni va aniqligingizni oshirish uchun maxsus ishlab chiqilgan, chunki imtihonda har bir xato ballingizga ta&apos;sir qiladi.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tips' && (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="border border-slate-900 bg-slate-950/40 p-3 rounded-lg">
                        <span className="font-bold text-white block mb-1">👀 Ekranga Qarash:</span>
                        Klaviaturadagi qo&apos;llaringizga umuman qaramaslikka intiling. Ekranga va virtual klaviaturadagi ko&apos;rsatgich chirog&apos;iga qarab yozing.
                      </div>
                      <div className="border border-slate-900 bg-slate-950/40 p-3 rounded-lg">
                        <span className="font-bold text-white block mb-1">🥁 Ritm Saqlash:</span>
                        Yozishda shoshilmasdan barqaror ritm saqlang. Harflarni bir xil vaqt oralig&apos;ida bosing. Shunda xatolar kam bo&apos;ladi.
                      </div>
                      <div className="border border-slate-900 bg-slate-950/40 p-3 rounded-lg">
                        <span className="font-bold text-white block mb-1">🔥 Streaks (Combo) Yig&apos;ish:</span>
                        Ketma-ket to&apos;g&apos;ri yozish orqali Combo (Streak) yarating! Bu sizga tezroq darajangizni (XP) oshirish va yozish tezligingizni yaxshilashga yordam beradi.
                      </div>
                      <div className="border border-slate-900 bg-slate-950/40 p-3 rounded-lg">
                        <span className="font-bold text-white block mb-1">🧠 AI Coach Tahlillari:</span>
                        Mashq tugagach AI Coach tomonidan berilgan tahlillarni albatta o&apos;qing. Dashboard bo&apos;limida OpenAI Coach sizning butun tarixingizni ko&apos;rib, shaxsiy maslahat beradi.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-900/80 pt-4 mt-6 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="rounded-xl bg-blue-650 hover:bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition-all select-none cursor-pointer"
              >
                Tushunarli 👍
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
