import React from 'react';
import { Delete } from 'lucide-react';

export const Keypad = ({ onInput, onDelete }: { onInput: (val: string) => void, onDelete: () => void }) => (
  <div className="grid grid-cols-3 gap-8 w-full px-4 mt-8">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <button 
        key={num}
        onClick={() => onInput(num.toString())}
        className="h-16 flex items-center justify-center font-headline text-2xl text-on-surface-variant hover:text-primary transition-colors active:scale-90"
      >
        {num}
      </button>
    ))}
    <div className="h-16"></div>
    <button 
      onClick={() => onInput('0')}
      className="h-16 flex items-center justify-center font-headline text-2xl text-on-surface-variant hover:text-primary transition-colors active:scale-90"
    >
      0
    </button>
    <button 
      onClick={onDelete}
      className="h-16 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-90"
    >
      <Delete size={24} />
    </button>
  </div>
);
