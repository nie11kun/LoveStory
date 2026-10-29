import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, ChevronDown, X, Play } from 'lucide-react';
import { Memory } from '../types';
import { isVideoUrl } from '../utils/media';
import { Thumb, ProgressiveImage } from '../components/MediaImage';
import { useColumnCount, toColumns } from '../utils/useColumnCount';

export const AlbumScreen = ({ memories, t }: { memories: Memory[], t: any }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(24);
  
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const allImages = sortedMemories.flatMap(m => m.images.map(img => ({ url: img, title: m.title, date: m.date })));
  const displayedImages = allImages.slice(0, displayCount);
  const columnCount = useColumnCount([[1024, 4], [768, 3]], 2);
  const columns = toColumns(displayedImages.map((img, idx) => ({ ...img, idx })), columnCount);
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
    <main className="pt-24 sm:pt-28 pb-36 px-4 sm:px-8 max-w-6xl mx-auto animate-fade-in">
      <section className="mb-10 sm:mb-14 text-center">
        <p className="eyebrow">{allImages.length} {t.photosCount}</p>
        <h1 className="mt-3 font-body font-semibold text-[32px] sm:text-[40px] tracking-tight text-ink">{t.albumTitle}</h1>
        <p className="mt-2 font-body text-[15px] text-ink-soft">{t.albumSubtitle}</p>
      </section>

      {allImages.length === 0 && (
        <p className="paper-card max-w-sm mx-auto px-6 py-10 text-center font-body text-ink-soft">{t.albumEmpty}</p>
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        {columns.map((col, c) => (
          <div key={c} className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4">
            {col.map(({ idx, ...img }) => (
              <motion.button
                type="button"
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedIndex(idx)}
                className="block w-full rounded-[18px] overflow-hidden bg-paper-deep relative cursor-zoom-in group shadow-[0_14px_30px_-18px_rgba(110,42,49,0.4)]"
              >
                {isVideoUrl(img.url) ? (
                  <>
                    <video src={`${img.url}#t=0.1`} preload="metadata" muted playsInline className="w-full h-auto min-h-[140px] object-cover bg-black/80 pointer-events-none" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full glass flex items-center justify-center text-rose">
                        <Play size={20} className="fill-rose ml-0.5" />
                      </span>
                    </span>
                  </>
                ) : (
                  <Thumb
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 p-3 pt-10 text-left bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="block font-body text-[13px] text-white truncate">{img.title}</span>
                  <span className="block font-label text-[10px] text-white/75">{img.date}</span>
                </span>
              </motion.button>
            ))}
          </div>
        ))}
      </div>

      {displayCount < allImages.length && (
        <div className="mt-14 text-center">
          <button
            onClick={() => setDisplayCount(prev => prev + 24)}
            className="btn-soft"
          >
            {t.loadMore}
            <ChevronDown size={16} />
          </button>
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedIndex !== null && allImages[selectedIndex] && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-[100] bg-[#1a1012]/95 backdrop-blur-sm flex items-center justify-center p-0 cursor-default"
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
                    {isVideoUrl(allImages[selectedIndex].url) ? (
                      <video src={allImages[selectedIndex].url} controls playsInline className="w-full h-full object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <ProgressiveImage
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
