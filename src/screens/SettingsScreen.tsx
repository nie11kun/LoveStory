import React from 'react';
import { Languages, LogOut, Heart } from 'lucide-react';
import { Language } from '../utils/i18n';

export const SettingsScreen = ({ onLogout, lang, onLanguageChange, t }: { onLogout: () => void, lang: Language, onLanguageChange: (l: Language) => void, t: any }) => (
  <main className="pt-24 sm:pt-28 pb-36 px-5 max-w-xl mx-auto animate-fade-in">
    <section className="mb-10 text-center">
      <p className="eyebrow">{t.storyteller}</p>
      <h2 className="mt-3 font-body font-semibold text-[32px] tracking-tight text-ink">{t.settings}</h2>
    </section>

    <div className="paper-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-full bg-blush text-rose flex items-center justify-center">
          <Languages size={17} />
        </span>
        <span className="font-body font-semibold text-[16px] text-ink">{t.language}</span>
      </div>
      <div className="flex p-1 bg-paper-deep rounded-full">
        {([['zh', '中文'], ['en', 'English']] as [Language, string][]).map(([code, label]) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code)}
            className={`flex-1 py-2.5 rounded-full font-label text-[14px] font-semibold transition-all ${lang === code ? 'bg-white shadow-[0_4px_12px_-6px_rgba(110,42,49,0.35)] text-rose' : 'text-ink-soft hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <button
      onClick={onLogout}
      className="mt-6 w-full h-14 paper-card rounded-full text-rose font-label font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
    >
      <LogOut size={18} />
      {t.logout}
    </button>

    <p className="mt-12 flex items-center justify-center gap-2 font-body text-[13px] text-muted">
      <Heart size={12} className="text-rose fill-rose" /> {t.eternity}
    </p>
  </main>
);
