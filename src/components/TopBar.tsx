import React, { useEffect, useState } from 'react';
import { Heart, Music } from 'lucide-react';
import { Thumb } from './MediaImage';

export const TopBar = ({ title, avatarUrl, onClickAvatar, hasMusic, isPlaying, onToggleMusic }: {
  title: string;
  avatarUrl?: string;
  onClickAvatar?: () => void;
  hasMusic?: boolean;
  isPlaying?: boolean;
  onToggleMusic?: () => void;
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] px-3 sm:px-6">
      <div
        className={`mt-2 sm:mt-3 mx-auto max-w-6xl h-14 flex items-center justify-between px-2 rounded-full transition-all duration-500 ${
          scrolled ? 'glass' : 'bg-transparent border border-transparent'
        }`}
      >
        {hasMusic ? (
          <button
            onClick={onToggleMusic}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-rose hover:bg-blush transition-colors"
          >
            {isPlaying ? (
              <span className="flex items-end gap-[3px] h-4" aria-hidden>
                {[0, 0.2, 0.4, 0.1].map((d, i) => (
                  <span key={i} className="eq-bar w-[3px] h-4 rounded-full bg-rose" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
            ) : (
              <Music size={19} />
            )}
          </button>
        ) : (
          <span className="w-10 h-10 flex items-center justify-center">
            <Heart size={20} className="text-rose fill-rose" />
          </span>
        )}

        <h1 className="font-body font-semibold text-[19px] sm:text-[21px] tracking-[0.06em] text-ink">
          {title}
        </h1>

        <button
          type="button"
          aria-label="Profile"
          className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-[0_4px_14px_-4px_rgba(110,42,49,0.35)] active:scale-95 transition-transform"
          onClick={onClickAvatar}
        >
          {avatarUrl ? (
            <Thumb src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-blush text-rose">
              <Heart size={16} className="fill-rose" />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
