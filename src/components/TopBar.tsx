import React from 'react';
import { Heart } from 'lucide-react';

export const TopBar = ({ title, avatarUrl, onClickAvatar }: { title: string; avatarUrl?: string; onClickAvatar?: () => void }) => (
  <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md">
    <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
      <Heart size={24} className="text-primary fill-primary" />
      <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">{title}</h1>
      <div 
        className={`w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container ${onClickAvatar ? 'cursor-pointer hover:shadow-md transition-all active:scale-95' : ''}`}
        onClick={onClickAvatar}
      >
        <img src={avatarUrl || "https://picsum.photos/seed/us/100/100"} alt="Profile" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
);
