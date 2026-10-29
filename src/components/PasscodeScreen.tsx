import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { Keypad } from './Keypad';
import { RisingHearts } from './RisingHearts';

export const PasscodeScreen = ({
  title,
  subtitle,
  targetPasscode,
  onSuccess,
  onCancel
}: {
  title: string;
  subtitle: string;
  targetPasscode: string;
  onSuccess: () => void;
  onCancel?: () => void;
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (val: string) => {
    if (input.length < 4) {
      const nextInput = input + val;
      setInput(nextInput);
      if (nextInput.length === 4) {
        if (nextInput === targetPasscode) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  // Physical keyboard: digits (incl. numpad), Backspace, and Escape to cancel.
  // The ref keeps one listener while still calling the latest handlers.
  const keyHandlers = useRef({ handleInput, handleDelete, onCancel });
  keyHandlers.current = { handleInput, handleDelete, onCancel };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { handleInput, handleDelete, onCancel } = keyHandlers.current;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 overflow-hidden bg-[linear-gradient(170deg,#fbe6e1_0%,#fbf5ef_48%,#f6e7d8_100%)]">
      <RisingHearts />

      {onCancel && (
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-5 w-11 h-11 flex items-center justify-center rounded-full glass text-ink-soft"
        >
          <X size={20} />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full flex flex-col items-center"
      >
        <div className="relative mb-6">
          <span className="absolute inset-0 rounded-full bg-rose/20 blur-xl" />
          <div className="relative w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#d6707a] to-[#a8434c] flex items-center justify-center shadow-[0_14px_30px_-10px_rgba(158,63,72,0.6)]">
            <Heart size={30} className="text-white fill-white animate-heartbeat" />
          </div>
        </div>

        <p className="eyebrow mb-3">Love Story</p>
        <h1 className="font-body font-semibold text-[28px] sm:text-[32px] tracking-tight text-ink text-center">{title}</h1>
        <p className="mt-2 font-body text-[15px] text-ink-soft text-center">{subtitle}</p>

        <div
          className={`flex gap-5 mt-9 mb-10 ${error ? 'animate-shake' : ''}`}
          role="status"
          aria-label={`${input.length} / 4`}
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = i < input.length;
            return (
              <Heart
                key={i}
                size={20}
                strokeWidth={1.8}
                className={`transition-all duration-200 ${
                  error ? 'text-rose-deep fill-rose-deep' : filled ? 'text-rose fill-rose scale-110' : 'text-muted/60 fill-transparent'
                }`}
              />
            );
          })}
        </div>

        <Keypad onInput={handleInput} onDelete={handleDelete} />
      </motion.div>
    </div>
  );
};
