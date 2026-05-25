'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypingEngineProps {
  targetText: string;
  typedText: string;
  onTypingChange: (newTyped: string, errors: number, correct: number, totalMistakes: number) => void;
  onKeyDown: (key: string) => void;
  onKeyUp: () => void;
  disabled?: boolean;
}

export default function TypingEngine({
  targetText,
  typedText,
  onTypingChange,
  onKeyDown,
  onKeyUp,
  disabled = false,
}: TypingEngineProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Permanent mistake counter — never decreases, even on backspace correction
  const [totalMistakes, setTotalMistakes] = useState(0);
  // Track previous typed length to detect new characters vs backspace
  const prevLengthRef = useRef(0);

  // Focus input on mount and when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Reset mistakes when targetText changes (new chunk)
  const prevTargetRef = useRef(targetText);
  useEffect(() => {
    if (targetText !== prevTargetRef.current) {
      prevTargetRef.current = targetText;
      setTotalMistakes(0);
      prevLengthRef.current = 0;
    }
  }, [targetText]);

  const handleInputFocus = () => {
    if (!disabled) {
      setIsFocused(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;

    // We only want to allow typing up to targetText length
    if (value.length > targetText.length) return;

    const prevLen = prevLengthRef.current;
    const newLen = value.length;

    // Track permanent mistakes: if a NEW character was typed (not backspace)
    // and it's wrong, increment totalMistakes
    let updatedMistakes = totalMistakes;
    if (newLen > prevLen) {
      for (let i = prevLen; i < newLen; i++) {
        if (value[i] !== targetText[i]) {
          updatedMistakes++;
        }
      }
      if (updatedMistakes !== totalMistakes) {
        setTotalMistakes(updatedMistakes);
      }
    }

    prevLengthRef.current = newLen;

    // Calculate current visible errors and correct characters
    let errors = 0;
    let correct = 0;

    for (let i = 0; i < value.length; i++) {
      if (value[i] === targetText[i]) {
        correct++;
      } else {
        errors++;
      }
    }

    onTypingChange(value, errors, correct, updatedMistakes);

    // Keyboard highlight for the last character typed
    if (newLen > prevLen && value.length > 0) {
      const lastChar = value[value.length - 1];
      onKeyDown(lastChar);
      setTimeout(() => {
        onKeyUp();
      }, 150);
    }
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === ' ') {
      onKeyDown(' ');
    } else if (e.key === 'Backspace') {
      onKeyDown('Backspace');
    }
  };

  const handleKeyUpInternal = () => {
    onKeyUp();
  };

  // Render character by character with visible spaces
  const renderCharacters = () => {
    return targetText.split('').map((char, index) => {
      const isSpace = char === ' ';
      let className = 'transition-all duration-150 ';

      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += isSpace
            ? 'space-char-correct text-emerald-450 border-emerald-500/30 bg-emerald-500/5'
            : 'char-correct text-emerald-400';
        } else {
          className += isSpace
            ? 'space-char-error text-rose-500 border-rose-500/30 bg-rose-500/5'
            : 'char-error text-rose-500 underline decoration-rose-500 decoration-2';
        }
      } else if (index === typedText.length) {
        if (isSpace) {
          className += isFocused
            ? 'space-char-current text-blue-400 border-blue-500 bg-blue-500/10'
            : 'space-char-pending text-slate-400 border-slate-800/30 bg-slate-950/20';
        } else {
          className += isFocused
            ? 'char-current text-blue-400 underline decoration-blue-500 decoration-2'
            : 'text-blue-305/85 underline decoration-blue-500/20';
        }
      } else {
        className += isSpace 
          ? 'space-char-idle text-slate-700 border-slate-800/10' 
          : 'char-pending text-slate-650';
      }

      if (isSpace) {
        return (
          <span
            key={index}
            className={`${className} inline-flex items-center justify-center font-sans text-lg md:text-xl px-1.5 py-0.5 mx-[2px] min-w-[26px] h-[36px] select-none rounded-[4px] border`}
            title="Bo'sh joy (probel)"
            style={{ direction: 'ltr' }}
          >
            <span>␣</span>
          </span>
        );
      }

      return (
        <span
          key={index}
          className={`${className} inline font-arabic text-4xl sm:text-5xl md:text-6xl lg:text-7xl select-none`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="relative w-full">
      {/* Hidden input to capture keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDownInternal}
        onKeyUp={handleKeyUpInternal}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        inputMode="text"
        className="absolute inset-0 w-full h-full opacity-0 cursor-default select-none z-0"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        dir="rtl"
      />

      {/* Typing display container */}
      <motion.div
        onClick={handleInputFocus}
        className={`relative z-10 w-full p-6 md:p-8 min-h-[160px] flex items-center justify-center rounded-2xl border bg-slate-950/40 backdrop-blur-md transition-all duration-300 cursor-text select-none ${
          isFocused
            ? 'border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-slate-950/60'
            : 'border-slate-900/80 hover:border-slate-800/80 hover:bg-slate-950/50'
        }`}
      >
        {/* Unfocused instruction overlay */}
        {!isFocused && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/30 rounded-2xl">
            <div className="flex items-center gap-2 text-sm md:text-base text-blue-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              👆 Yozishni boshlash uchun shu yerga bosing
            </div>
            <span className="text-xs text-slate-500 mt-1.5">
              Probel belgisi: <span className="text-blue-300 font-bold px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 font-sans text-xs">␣</span> ko&apos;rinishida yoziladi.
            </span>
          </div>
        )}

        {/* Chunk progress bar */}
        {typedText.length > 0 && targetText.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/60 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200 ease-out progress-fill"
              style={{ width: `${(typedText.length / targetText.length) * 100}%` }}
            />
          </div>
        )}

        {/* Arab text container */}
        <div
          className="w-full text-right leading-[2.2] max-w-4xl select-none"
          dir="rtl"
          style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          {renderCharacters()}
        </div>
      </motion.div>
    </div>
  );
}
