import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { Keypad } from './Keypad';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-8 left-8 w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <X size={24} />
        </button>
      )}

      <div className="text-center mb-6 space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-low mb-2 shadow-sm">
          <Lock size={40} className="text-primary" />
        </div>
        <h1 className="font-headline font-bold text-3xl sm:text-4xl tracking-tight text-on-surface">{title}</h1>
        <p className="font-headline italic text-on-surface-variant text-lg">{subtitle}</p>
      </div>

      <div className={`flex gap-6 mb-6 transition-transform ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < input.length ? 'bg-primary shadow-[0_0_12px_rgba(139,76,80,0.3)]' : 'bg-surface-variant'
            }`}
          ></div>
        ))}
      </div>

      <Keypad onInput={handleInput} onDelete={handleDelete} />
    </div>
  );
};
