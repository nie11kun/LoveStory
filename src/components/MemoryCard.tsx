import React, { useState } from 'react';
import { Memory } from '../types';

export const MemoryCard = ({ memory, index, t, formatDate, onClick }: { memory: Memory, index: number, t: any, formatDate: (s: string) => string, onClick?: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollLeft;
    const slideWidth = element.clientWidth;
    const newSlide = Math.round(scrollPosition / slideWidth);
    if (newSlide !== currentSlide) {
      setCurrentSlide(newSlide);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-3 mb-2 ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
        <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1 rounded-full font-headline italic text-sm whitespace-nowrap">
          {formatDate(memory.date)}
        </span>
        <span className="font-body text-xs text-secondary italic opacity-80 whitespace-nowrap">
          {t.daysAgo.replace('{days}', memory.daysAgo.toString())}
        </span>
        <div className="h-[1px] flex-grow bg-outline-variant opacity-30"></div>
      </div>

      <div 
        className={`bg-white rounded-2xl p-3 shadow-sm overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
      >
        {memory.images && memory.images.length > 0 && (
          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-variant flex">
            <div 
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
              onScroll={handleScroll}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {memory.images.map((img: string, i: number) => (
                <div key={i} className="min-w-full h-full snap-center relative flex-shrink-0">
                  {img.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={img} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={img} alt={`${memory.title} ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
              ))}
            </div>
            
            {memory.images && memory.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                {memory.images.map((_: any, i: number) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${i === currentSlide ? 'bg-white scale-110' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className={`${memory.images && memory.images.length > 0 ? 'mt-6' : 'mt-2'} px-2 pb-2 ${index % 2 !== 0 ? 'text-right' : ''}`}>
          <h3 className="font-headline text-2xl text-primary mb-2">{memory.title}</h3>
          <p className={`font-body text-on-surface-variant leading-relaxed whitespace-pre-wrap ${onClick ? 'line-clamp-3 text-fade-out' : ''}`}>
            {memory.description}
          </p>
          <div className={`mt-4 flex flex-wrap gap-2 ${index % 2 !== 0 ? 'justify-end' : ''}`}>
            {memory.tags.map((tag: string) => (
              <span key={tag} className="bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-1 text-[10px] font-body uppercase tracking-widest text-secondary">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
