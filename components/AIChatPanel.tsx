'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    level: number;
    skillLevel: number;
    recentWpm?: number;
    recentAccuracy?: number;
  };
}

export default function AIChatPanel({ isOpen, onClose, context }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Assalomu alaykum! Men sizning arab tili va klaviatura bo'yicha AI yordamchingizman. Arabcha harflar joylashuvi yoki yozish usullari haqida nimalarni o'rganmoqchisiz?",
      isUser: false,
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userText = inputVal.trim();
    setInputVal('');
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          context: context,
        }),
      });

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Uzr, javobni olishda muammo yuz berdi.",
        isUser: false,
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Aloqa uzildi. Iltimos, internetingizni tekshirib, qaytadan yuboring.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#07070c] border-l border-slate-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-900/80 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="font-bold text-white text-sm">AI Tutor Assistant</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-white flex items-center justify-center transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10'
                        : 'bg-slate-900/60 border border-slate-800/60 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-900/80 bg-slate-950/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Klaviatura o'rnatish haqida..."
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500/40 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !inputVal.trim()}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 px-4 py-2.5 text-white font-semibold transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
