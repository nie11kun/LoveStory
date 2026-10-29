import React from 'react';
import { ChevronLeft, PenLine, Trash2 } from 'lucide-react';
import { MemoryCard } from '../components/MemoryCard';
import { Memory } from '../types';
import { Language } from '../utils/i18n';

export const MemoryDetailScreen = ({ memory, onBack, onEdit, onDelete, t, lang }: { memory: Memory, onBack: () => void, onEdit: (m: Memory) => void, onDelete: (id: string) => void, t: any, lang: Language }) => {
  const formatDate = (dateStr: string) => {
    if (lang === 'zh') {
      const parts = dateStr.split('-');
      return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
    }
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <main className="pt-24 sm:pt-28 pb-36 px-5 max-w-2xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-5">
        <button onClick={onBack} className="glass h-10 pl-2 pr-4 rounded-full text-ink-soft hover:text-rose transition-colors flex items-center gap-1">
          <ChevronLeft size={20} />
          <span className="font-label text-[13px] font-semibold">{t.timeline}</span>
        </button>
        <div className="flex gap-2">
          <button onClick={() => onEdit(memory)} aria-label={t.edit} className="glass w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:text-rose transition-colors">
            <PenLine size={17} />
          </button>
          <button
            onClick={() => { if (window.confirm(t.confirmDelete)) onDelete(memory.id); }}
            aria-label={t.delete}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-rose hover:text-rose-deep transition-colors"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <MemoryCard memory={memory} index={0} t={t} formatDate={formatDate} />
    </main>
  );
};
