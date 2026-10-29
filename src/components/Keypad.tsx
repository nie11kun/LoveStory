import React from 'react';
import { Delete } from 'lucide-react';

const keyClass =
  'w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] mx-auto rounded-full flex items-center justify-center font-headline text-[28px] text-ink bg-white/55 border border-white/80 shadow-[0_6px_18px_-10px_rgba(110,42,49,0.35)] backdrop-blur-md hover:bg-white/80 active:scale-90 active:bg-blush transition-all touch-manipulation';

export const Keypad = ({ onInput, onDelete }: { onInput: (val: string) => void, onDelete: () => void }) => (
  <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-5 w-full max-w-[300px] mx-auto relative z-10">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <button
        key={num}
        type="button"
        onClick={() => onInput(num.toString())}
        className={keyClass}
      >
        {num}
      </button>
    ))}
    <div />
    <button
      type="button"
      onClick={() => onInput('0')}
      className={keyClass}
    >
      0
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label="Delete"
      className="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] mx-auto rounded-full flex items-center justify-center text-ink-soft hover:text-rose active:scale-90 transition-all touch-manipulation"
    >
      <Delete size={24} className="pointer-events-none" />
    </button>
  </div>
);
