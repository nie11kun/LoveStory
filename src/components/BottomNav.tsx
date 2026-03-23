import React from 'react';
import { History, Image as ImageIcon, PlusCircle, Settings as SettingsIcon } from 'lucide-react';
import { Screen } from '../types';

export const BottomNav = ({ activeScreen, onNavigate, t }: { activeScreen: Screen, onNavigate: (s: Screen) => void, t: any }) => {
  if (activeScreen === 'lock') return null;

  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'timeline', icon: History, label: t.timeline },
    { id: 'album', icon: ImageIcon, label: t.album },
    { id: 'add', icon: PlusCircle, label: t.add },
    { id: 'settings', icon: SettingsIcon, label: t.settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-8 px-4 bg-surface-container-highest/70 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-4px_24px_rgba(28,27,26,0.06)] z-50">
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-primary scale-110' : 'text-secondary opacity-60'
            }`}
          >
            <Icon size={24} fill={isActive ? 'currentColor' : 'none'} />
            <span className="font-body font-medium text-[10px] uppercase tracking-widest mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
