import React from 'react';
import { motion } from 'motion/react';
import { BookHeart, Images, Plus, UserRound, Settings as SettingsIcon } from 'lucide-react';
import { Screen } from '../types';

export const BottomNav = ({ activeScreen, onNavigate, onProfile, t }: { activeScreen: Screen, onNavigate: (s: Screen) => void, onProfile: () => void, t: any }) => {
  if (activeScreen === 'lock' || activeScreen === 'passcode_verify') return null;

  const current = activeScreen === 'detail' ? 'timeline' : activeScreen === 'edit' ? 'add' : activeScreen;

  const tabs: { id: Screen; icon: any; label: string; onClick?: () => void }[] = [
    { id: 'timeline', icon: BookHeart, label: t.timeline },
    { id: 'album', icon: Images, label: t.album },
    { id: 'add', icon: Plus, label: t.add },
    { id: 'profile', icon: UserRound, label: t.us, onClick: onProfile },
    { id: 'settings', icon: SettingsIcon, label: t.settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-center px-4 pointer-events-none pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="glass pointer-events-auto w-full max-w-[420px] h-[68px] rounded-[28px] flex items-center justify-between px-2">
        {tabs.map((tab) => {
          const isActive = current === tab.id;
          const Icon = tab.icon;
          const handle = tab.onClick || (() => onNavigate(tab.id));

          if (tab.id === 'add') {
            return (
              <button
                key={tab.id}
                onClick={handle}
                aria-label={tab.label}
                className="relative -mt-7 w-[58px] h-[58px] shrink-0 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#d6707a] to-[#a8434c] shadow-[0_12px_24px_-8px_rgba(158,63,72,0.65)] ring-[5px] ring-paper active:scale-95 transition-transform"
              >
                <Icon size={26} strokeWidth={2.4} />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={handle}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-rose' : 'text-muted hover:text-ink-soft'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-pill"
                  className="absolute inset-x-1.5 inset-y-2 rounded-[20px] bg-blush/80"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} className="relative" />
              <span className="relative font-label text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
