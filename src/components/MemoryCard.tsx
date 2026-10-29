import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Memory } from '../types';
import { calculateDaysAgo } from '../utils/date';
import { isVideoUrl } from '../utils/media';
import { Thumb, ProgressiveImage } from './MediaImage';

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

  const hasMedia = memory.images && memory.images.length > 0;

  // Enter/Space activate a focusable non-button element, but only when it is the one focused (not a child control)
  const onActivateKey = (action: () => void) => (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    action();
  };

  return (
    <div className="h-full">
      <div
        className={`paper-card p-2.5 overflow-hidden group ${onClick ? 'cursor-pointer transition-transform duration-500 hover:-translate-y-1' : ''}`}
        onClick={onClick}
        {...(onClick && {
          role: 'button',
          tabIndex: 0,
          'aria-label': memory.title,
          onKeyDown: onActivateKey(onClick),
        })}
      >
        {hasMedia && (
          <div className="relative aspect-[4/5] rounded-[18px] overflow-hidden bg-paper-deep flex">
            <div
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
              onScroll={handleScroll}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {memory.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="w-full h-full flex-none snap-center relative cursor-zoom-in overflow-hidden isolate"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                  // In the timeline the whole card is the keyboard target; on the detail page each photo opens the viewer
                  {...(!onClick && {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `${memory.title} ${i + 1}`,
                    onKeyDown: onActivateKey(() => setSelectedIndex(i)),
                  })}
                >
                  {/* Blurred Background Layer for elegant letterboxing (isolated to prevent Safari layout bleed) */}
                  {!isVideoUrl(img) && (
                    <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none select-none z-0">
                      <Thumb src={img} className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-125 pointer-events-none" alt="" />
                    </div>
                  )}

                  {isVideoUrl(img) ? (
                    <video src={`${img}#t=0.1`} preload="metadata" playsInline controls className="relative z-10 w-full h-full object-contain bg-black/80" onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <Thumb
                      src={img}
                      alt={`${memory.title} ${i+1}`}
                      loading="lazy"
                      className="relative z-10 w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  )}
                </div>
              ))}
            </div>

            <span className="absolute top-3 left-3 z-20 glass rounded-full px-3 py-1 font-label text-[11px] font-semibold text-ink-soft">
              {t.daysAgo.replace('{days}', calculateDaysAgo(memory.date).toString())}
            </span>

            {memory.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/25 px-2.5 py-1.5 rounded-full backdrop-blur-md">
                {memory.images.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`${hasMedia ? 'pt-4' : 'pt-3'} px-3 pb-3 ${index % 2 !== 0 ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 font-label text-[12px] font-semibold tracking-wide text-rose ${index % 2 !== 0 ? 'justify-end' : ''}`}>
            <span>{formatDate(memory.date)}</span>
            {!hasMedia && (
              <>
                <span className="w-1 h-1 rounded-full bg-rose/40" />
                <span className="text-muted font-medium">{t.daysAgo.replace('{days}', calculateDaysAgo(memory.date).toString())}</span>
              </>
            )}
          </div>
          <h3 className="mt-1.5 font-body font-semibold text-[21px] leading-snug text-ink">{memory.title}</h3>
          <p className={`mt-2 font-body text-[15px] text-ink-soft leading-[1.85] whitespace-pre-wrap ${onClick ? 'line-clamp-3 text-fade-out' : ''}`}>
            {memory.description}
          </p>
          {memory.tags.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-1.5 ${index % 2 !== 0 ? 'justify-end' : ''}`}>
              {memory.tags.map((tag: string) => (
                <span key={tag} className="chip">#{tag}</span>
              ))}
            </div>
          )}
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
              className="fixed inset-0 z-[100] bg-[#1a1012]/95 backdrop-blur-sm flex items-center justify-center p-0 cursor-default"
            >
              <button 
                autoFocus
                aria-label="Close"
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
                    {isVideoUrl(memory.images[selectedIndex]) ? (
                      <video src={memory.images[selectedIndex]} controls playsInline className="w-full h-full object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <ProgressiveImage
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
