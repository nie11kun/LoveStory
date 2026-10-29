import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, X } from 'lucide-react';

const TOAST_EVENT = 'lovestory:toast';
const TOAST_DURATION_MS = 3600;

// Fire-and-forget from anywhere (screens, async handlers) without threading props through the tree
export const showToast = (message: string) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
};

export const Toaster = ({ dismissLabel }: { dismissLabel: string }) => {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => setToast({ id: Date.now(), message: (e as CustomEvent<string>).detail });
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+76px)] z-[120] flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass pointer-events-auto max-w-sm w-full flex items-center gap-3 rounded-2xl pl-4 pr-2 py-2.5"
          >
            <CircleAlert size={18} className="text-rose shrink-0" />
            <p className="flex-1 font-body text-[14px] leading-snug text-ink">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              aria-label={dismissLabel}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-blush transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
