import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Memory } from '../types';

export const AlbumScreen = ({ memories, t }: { memories: Memory[], t: any }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const allImages = memories.flatMap(m => m.images.map(img => ({ url: img, title: m.title, date: m.date })));
  const minSwipeDistance = 50;

  useEffect(() => {
    if (selectedIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedIndex < allImages.length - 1) setSelectedIndex(selectedIndex + 1);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allImages.length]);

  return (
    <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto animate-fade-in">
      <section className="mb-12 text-center">
        <h1 className="font-headline font-bold text-4xl tracking-tight text-primary mb-2">{t.albumTitle}</h1>
        <p className="font-headline italic text-on-surface-variant text-lg">{t.albumSubtitle}</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allImages.map((img, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(idx)}
            className="aspect-square rounded-xl overflow-hidden bg-black/5 relative cursor-pointer shadow-sm group"
          >
            {!img.url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) && (
              <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none select-none z-0">
                <img src={img.url} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-125 pointer-events-none" alt="" />
              </div>
            )}
            
            {img.url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? (
              <video src={`${img.url}#t=0.1`} preload="metadata" playsInline controls className="relative z-10 w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
            ) : (
              <img 
                src={img.url} 
                alt={img.title} 
                className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center flex flex-col items-center">
        <div className="w-12 h-[1px] bg-outline-variant mb-6"></div>
        <button className="font-body text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-2">
          {t.loadMore}
          <ChevronRight size={14} className="rotate-90" />
        </button>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedIndex !== null && allImages[selectedIndex] && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
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

              {selectedIndex < allImages.length - 1 && (
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
                      if (swipe < -minSwipeDistance && selectedIndex < allImages.length - 1) {
                        setSelectedIndex(selectedIndex + 1);
                      } else if (swipe > minSwipeDistance && selectedIndex > 0) {
                        setSelectedIndex(selectedIndex - 1);
                      }
                    }}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:cursor-grab touch-none"
                  >
                    {allImages[selectedIndex].url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) ? (
                      <video src={allImages[selectedIndex].url} controls playsInline className="w-full h-full object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <img 
                        src={allImages[selectedIndex].url} 
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
    </main>
  );
};
