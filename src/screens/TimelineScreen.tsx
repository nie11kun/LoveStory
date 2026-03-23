import React from 'react';
import { motion } from 'motion/react';
import { MemoryCard } from '../components/MemoryCard';
import { Memory } from '../types';
import { Language } from '../utils/i18n';
import { ChevronRight } from 'lucide-react';

export const TimelineScreen = ({ memories, t, lang, onSelectMemory }: { memories: Memory[], t: any, lang: Language, onSelectMemory: (m: Memory) => void }) => {
  const [displayCount, setDisplayCount] = React.useState(10);
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedMemories = sortedMemories.slice(0, displayCount);

  const formatDate = (dateStr: string) => {
    if (lang === 'zh') {
      const parts = dateStr.split('-');
      return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
    }
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
      <section className="mb-12 text-center">
        <p className="font-headline italic text-on-surface-variant text-lg leading-relaxed">
          {t.quote}
        </p>
      </section>

      <div className="relative space-y-16">
        {displayedMemories.map((memory, index) => (
          <motion.article 
            key={memory.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <MemoryCard memory={memory} index={index} t={t} formatDate={formatDate} onClick={() => onSelectMemory(memory)} />
          </motion.article>
        ))}
      </div>

      {displayCount < sortedMemories.length && (
        <div className="mt-20 text-center flex flex-col items-center">
          <div className="w-12 h-[1px] bg-outline-variant mb-6"></div>
          <button 
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="font-body text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-2"
          >
            {t.loadMore}
            <ChevronRight size={14} className="rotate-90" />
          </button>
        </div>
      )}
    </main>
  );
};
