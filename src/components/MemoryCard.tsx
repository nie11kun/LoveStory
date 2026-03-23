import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Memory } from '../types';

export const MemoryCard = ({ memory, index, t, formatDate, onClick }: { memory: Memory, index: number, t: any, formatDate: (s: string) => string, onClick?: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (selectedIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedIndex < (memory.images?.length || 0) - 1) setSelectedIndex(selectedIndex + 1);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, memory.images?.length]);

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
                <div 
                  key={i} 
                  className="w-full h-full flex-none snap-center relative cursor-pointer overflow-hidden bg-black/5 isolate"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                >
                  {/* Blurred Background Layer for elegant letterboxing (isolated to prevent Safari layout bleed) */}
                  {!img.match(/\.(mp4|webm|ogg|mov|m4v)$/i) && (
                    <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none select-none z-0">
                      <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-125 pointer-events-none" alt="" />
                    </div>
                  )}
                  
                  {img.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? (
                    <video src={`${img}#t=0.1`} preload="metadata" playsInline controls className="relative z-10 w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <img 
                      src={img} 
                      alt={`${memory.title} ${i+1}`} 
                      className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                    />
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

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedIndex !== null && memory.images[selectedIndex] && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-[2px] flex items-center justify-center p-0 cursor-default"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full"
              >
                <X size={28} />
              </button>
              
              {selectedIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                  className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full z-[110]"
                >
                  <ChevronLeft size={36} />
                </button>
              )}

              {selectedIndex < memory.images.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full z-[110]"
                >
                  <ChevronRight size={36} />
                </button>
              )}

              <div 
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={(e, { offset }) => {
                      const swipe = offset.x;
                      if (swipe < -minSwipeDistance && selectedIndex < (memory.images?.length || 0) - 1) {
                        setSelectedIndex(selectedIndex + 1);
                      } else if (swipe > minSwipeDistance && selectedIndex > 0) {
                        setSelectedIndex(selectedIndex - 1);
                      }
                    }}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:cursor-grab touch-none"
                  >
                    {memory.images[selectedIndex].match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? (
                      <video src={memory.images[selectedIndex]} controls playsInline className="w-full h-full object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <img 
                        src={memory.images[selectedIndex]} 
                        alt="Enlarged" 
                        className="w-full h-full object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] select-none pointer-events-none" 
                        draggable={false}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
