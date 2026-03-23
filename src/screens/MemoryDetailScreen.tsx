import React from 'react';
import { ChevronRight } from 'lucide-react';
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
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-secondary hover:text-primary transition-colors flex items-center">
          <ChevronRight className="rotate-180" size={24} />
          <span className="font-body text-sm ml-1">{t.timeline}</span>
        </button>
        <div className="flex gap-4">
          <button onClick={() => onEdit(memory)} className="text-secondary hover:text-primary transition-colors font-body text-sm font-medium">{t.edit}</button>
          <button 
            onClick={() => { if (window.confirm(t.confirmDelete)) onDelete(memory.id); }} 
            className="text-primary hover:text-red-500 transition-colors font-body text-sm font-medium"
          >
            {t.delete}
          </button>
        </div>
      </div>
      
      <MemoryCard memory={memory} index={0} t={t} formatDate={formatDate} />
    </main>
  );
};
