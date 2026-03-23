import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { Language } from '../utils/i18n';

export const SettingsScreen = ({ onLogout, lang, onLanguageChange, t }: { onLogout: () => void, lang: Language, onLanguageChange: (l: Language) => void, t: any }) => (
  <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-12 animate-fade-in">
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-2xl italic text-on-surface">{t.settings}</h2>
        <span className="text-xs font-body uppercase tracking-widest text-secondary opacity-70">{t.storyteller}</span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="font-body text-sm font-medium text-secondary flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            {t.language}
          </label>
          <div className="flex p-1 bg-surface-container rounded-xl">
            <button 
              onClick={() => onLanguageChange('zh')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'zh' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              中文
            </button>
            <button 
              onClick={() => onLanguageChange('en')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              English
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-8">
        <button 
          onClick={onLogout}
          className="w-full h-14 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-body font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 duration-200"
        >
          <LogOut size={20} />
          {t.logout}
        </button>
      </div>
    </section>
  </main>
);
