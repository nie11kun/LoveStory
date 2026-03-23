import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import { Memory } from '../types';

export const AlbumScreen = ({ memories, t }: { memories: Memory[], t: any }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const allImages = memories.flatMap(m => m.images.map(img => ({ url: img, title: m.title, date: m.date })));

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
            onClick={() => setSelectedImage(img.url)}
            className="aspect-square rounded-xl overflow-hidden bg-surface-container cursor-pointer shadow-sm group"
          >
            {img.url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
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

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={selectedImage} controls playsInline className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              ) : (
                <img 
                  src={selectedImage} 
                  alt="Enlarged" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                />
              )}
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
