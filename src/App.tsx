/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  History, 
  Image as ImageIcon, 
  PlusCircle, 
  Settings as SettingsIcon, 
  Lock, 
  ChevronRight, 
  Calendar, 
  Check, 
  LogOut, 
  Sparkles,
  Plus,
  Delete,
  X
} from 'lucide-react';
import { Screen, Memory, UserProfile } from './types';
import { INITIAL_MEMORIES, INITIAL_PROFILE } from './constants';

// --- Types & Translations ---
type Language = 'zh' | 'en';

const translations = {
  zh: {
    timeline: '时间轴',
    album: '相册',
    add: '添加',
    settings: '设置',
    ourStory: '我们的故事',
    securityTitle: '安全验证',
    securitySubtitleMain: '验证身份以开启旅程',
    securitySubtitleAdd: '验证身份以添加记忆',
    quote: '"每一个爱情故事都很美，但我们的故事是我最喜欢的。"',
    daysAgo: '已过去 {days} 天',
    captureMoment: '捕捉瞬间',
    addDescription: '为我们的数字传家宝添加新篇章。',
    addMedia: '添加图片或视频',
    upload: '上传',
    title: '标题',
    titlePlaceholder: '给这段记忆起个名字...',
    story: '我们的故事',
    storyPlaceholder: '记录下那些让我们心动的瞬间...',
    date: '选择日期',
    tags: '添加标签',
    save: '保存至时间轴',
    eternity: '永恒从现在开始',
    albumTitle: '相册回顾',
    albumSubtitle: '捕捉到的每一刻都是我们的一部分。',
    allMemories: '全部记忆',
    travel: '我们的旅行',
    daily: '日常生活',
    wedding: '婚礼',
    loadMore: '加载更多记忆',
    logout: '退出我们的故事',
    language: '语言设置',
    storyteller: '故事讲述者',
    cancel: '取消',
    tagTravel: '旅行',
    tagDaily: '日常',
    tagAnniversary: '纪念日'
  },
  en: {
    timeline: 'Timeline',
    album: 'Album',
    add: 'Add',
    settings: 'Settings',
    ourStory: 'Our Story',
    securityTitle: 'Security Check',
    securitySubtitleMain: 'Verify identity to start the journey',
    securitySubtitleAdd: 'Verify identity to add a memory',
    quote: '"Every love story is beautiful, but ours is my favorite."',
    daysAgo: '{days} days ago',
    captureMoment: 'Capture Moment',
    addDescription: 'Add a new chapter to our digital heirloom.',
    addMedia: 'Add Photo or Video',
    upload: 'Upload',
    title: 'Title',
    titlePlaceholder: 'Give this memory a name...',
    story: 'Our Story',
    storyPlaceholder: 'Record those moments that make our hearts flutter...',
    date: 'Select Date',
    tags: 'Add Tags',
    save: 'Save to Timeline',
    eternity: 'Eternity starts now',
    albumTitle: 'Album Review',
    albumSubtitle: 'Every moment captured is a part of us.',
    allMemories: 'All Memories',
    travel: 'Our Travels',
    daily: 'Daily Life',
    wedding: 'Wedding',
    loadMore: 'Load More Memories',
    logout: 'Log Out of Our Story',
    language: 'Language Settings',
    storyteller: 'Storyteller',
    cancel: 'Cancel',
    tagTravel: 'Travel',
    tagDaily: 'Daily',
    tagAnniversary: 'Anniversary'
  }
};

// --- Constants ---
const MAIN_PASSCODE = '4641';
const ADD_PASSCODE = '1234';
const UNLOCK_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day

// --- Components ---

const BottomNav = ({ activeScreen, onNavigate, t }: { activeScreen: Screen, onNavigate: (s: Screen) => void, t: any }) => {
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

const TopBar = ({ title, avatarUrl }: { title: string; avatarUrl?: string }) => (
  <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md">
    <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
      <Heart size={24} className="text-primary fill-primary" />
      <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">{title}</h1>
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
);

const Keypad = ({ onInput, onDelete }: { onInput: (val: string) => void, onDelete: () => void }) => (
  <div className="grid grid-cols-3 gap-8 w-full px-4 mt-8">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <button 
        key={num}
        onClick={() => onInput(num.toString())}
        className="h-16 flex items-center justify-center font-headline text-2xl text-on-surface-variant hover:text-primary transition-colors active:scale-90"
      >
        {num}
      </button>
    ))}
    <div className="h-16"></div>
    <button 
      onClick={() => onInput('0')}
      className="h-16 flex items-center justify-center font-headline text-2xl text-on-surface-variant hover:text-primary transition-colors active:scale-90"
    >
      0
    </button>
    <button 
      onClick={onDelete}
      className="h-16 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-90"
    >
      <Delete size={24} />
    </button>
  </div>
);

// --- Screens ---

const PasscodeScreen = ({ 
  title, 
  subtitle, 
  targetPasscode, 
  onSuccess,
  onCancel
}: { 
  title: string; 
  subtitle: string; 
  targetPasscode: string; 
  onSuccess: () => void;
  onCancel?: () => void;
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (val: string) => {
    if (input.length < 4) {
      const nextInput = input + val;
      setInput(nextInput);
      if (nextInput.length === 4) {
        if (nextInput === targetPasscode) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-8 left-8 w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <X size={24} />
        </button>
      )}

      <div className="text-center mb-12 space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-low mb-6 shadow-sm">
          <Lock size={40} className="text-primary" />
        </div>
        <h1 className="font-headline font-bold text-4xl tracking-tight text-on-surface">{title}</h1>
        <p className="font-headline italic text-on-surface-variant text-lg">{subtitle}</p>
      </div>

      <div className={`flex gap-6 mb-12 transition-transform ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < input.length ? 'bg-primary shadow-[0_0_12px_rgba(139,76,80,0.3)]' : 'bg-surface-variant'
            }`}
          ></div>
        ))}
      </div>

      <Keypad onInput={handleInput} onDelete={handleDelete} />
    </div>
  );
};

const TimelineScreen = ({ memories, t, lang }: { memories: Memory[], t: any, lang: Language }) => {
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    if (lang === 'zh') {
      const parts = dateStr.split('-');
      return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
    }
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
      <section className="mb-12 text-center">
        <p className="font-headline italic text-on-surface-variant text-lg leading-relaxed">
          {t.quote}
        </p>
      </section>

      <div className="relative space-y-16">
        {sortedMemories.map((memory, index) => (
          <motion.article 
            key={memory.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex flex-col gap-4">
              <div className={`flex items-center gap-3 mb-2 ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1 rounded-full font-headline italic text-sm">
                  {formatDate(memory.date)}
                </span>
                <span className="font-body text-xs text-secondary italic opacity-80">{t.daysAgo.replace('{days}', memory.daysAgo.toString())}</span>
                <div className="h-[1px] flex-grow bg-outline-variant opacity-30"></div>
              </div>

              <div className="bg-white rounded-2xl p-3 shadow-sm overflow-hidden group">
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={memory.images[0]} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm"></div>
                  </div>
                </div>
                <div className={`mt-6 px-2 pb-2 ${index % 2 !== 0 ? 'text-right' : ''}`}>
                  <h3 className="font-headline text-2xl text-primary mb-2">{memory.title}</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    {memory.description}
                  </p>
                  <div className={`mt-4 flex flex-wrap gap-2 ${index % 2 !== 0 ? 'justify-end' : ''}`}>
                    {memory.tags.map(tag => (
                      <span key={tag} className="bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-1 text-[10px] font-body uppercase tracking-widest text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
};

const AddMemoryScreen = ({ t }: { t: any }) => (
  <main className="pt-24 pb-32 px-6 max-w-screen-md mx-auto animate-fade-in">
    <section className="mb-12">
      <h2 className="font-headline text-4xl text-on-surface mb-2 italic">{t.captureMoment}</h2>
      <p className="text-on-surface-variant font-body">{t.addDescription}</p>
    </section>

    <form className="space-y-10">
      <div className="space-y-4">
        <label className="font-body text-sm uppercase tracking-widest text-secondary block ml-1">{t.addMedia}</label>
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm -rotate-1 relative group transition-transform hover:rotate-0">
            <img src="https://picsum.photos/seed/sunset/400/400" alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm rotate-1 relative group transition-transform hover:rotate-0">
            <img src="https://picsum.photos/seed/camera/400/400" alt="Preview" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <History size={32} className="text-on-surface-variant" />
            </div>
          </div>
          <button type="button" className="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline transition-all hover:bg-surface-container-low hover:border-primary/40 group">
            <Plus size={32} className="group-hover:scale-110 transition-transform" />
            <span className="font-body text-[10px] mt-1 opacity-60">{t.upload}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-secondary ml-1">{t.title}</label>
        <input 
          className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container/30 font-headline text-xl italic" 
          placeholder={t.titlePlaceholder} 
          type="text"
        />
      </div>

      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-secondary ml-1">{t.story}</label>
        <textarea 
          className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface-variant placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container/30 font-body leading-relaxed" 
          placeholder={t.storyPlaceholder} 
          rows={6}
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.date}</label>
          <div className="relative">
            <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body" type="date" />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.tags}</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {[t.tagTravel, t.tagDaily, t.tagAnniversary].map((tag, i) => (
              <button key={tag} type="button" className={`px-4 py-2 rounded-full text-xs font-body transition-colors ${i === 1 ? 'bg-primary-container/20 border border-primary/20 text-primary font-bold' : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-primary-container hover:text-white'}`}>
                {tag}
              </button>
            ))}
            <button type="button" className="w-8 h-8 flex items-center justify-center bg-surface-container-high rounded-full text-outline hover:text-primary transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col items-center">
        <button className="w-full md:w-auto md:min-w-[280px] h-14 bg-gradient-to-r from-primary to-primary-container text-white font-body font-bold text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          {t.save}
        </button>
        <p className="mt-4 text-[10px] font-body uppercase tracking-widest text-outline/60">{t.eternity}</p>
      </div>
    </form>
  </main>
);

const AlbumScreen = ({ memories, t }: { memories: Memory[], t: any }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Extract all images from all memories
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
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
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

      {/* Lightbox Modal */}
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
              <img 
                src={selectedImage} 
                alt="Enlarged" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
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

const SettingsScreen = ({ onLogout, lang, onLanguageChange, t }: { onLogout: () => void, lang: Language, onLanguageChange: (l: Language) => void, t: any }) => (
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

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [isAddLocked, setIsAddLocked] = useState(true);
  const [memories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [profile] = useState<UserProfile>(INITIAL_PROFILE);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    return (saved as Language) || 'zh';
  });

  const t = translations[lang];

  // Persistence Logic
  useEffect(() => {
    const lastUnlock = localStorage.getItem('lastUnlockTime');
    const lastAddUnlock = localStorage.getItem('lastAddUnlockTime');
    const now = Date.now();

    if (lastUnlock && now - parseInt(lastUnlock) < UNLOCK_EXPIRY_MS) {
      setScreen('timeline');
    }
    if (lastAddUnlock && now - parseInt(lastAddUnlock) < UNLOCK_EXPIRY_MS) {
      setIsAddLocked(false);
    }
  }, []);

  const handleMainUnlock = () => {
    localStorage.setItem('lastUnlockTime', Date.now().toString());
    setScreen('timeline');
  };

  const handleAddUnlock = () => {
    localStorage.setItem('lastAddUnlockTime', Date.now().toString());
    setIsAddLocked(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('lastUnlockTime');
    localStorage.removeItem('lastAddUnlockTime');
    setScreen('lock');
    setIsAddLocked(true);
  };

  const handleLanguageChange = (l: Language) => {
    setLang(l);
    localStorage.setItem('appLanguage', l);
  };

  const navigateTo = (s: Screen) => {
    setScreen(s);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container/30">
      <AnimatePresence mode="wait">
        {screen === 'lock' && (
          <motion.div key="lock" exit={{ opacity: 0, scale: 0.95 }}>
            <PasscodeScreen 
              title={t.securityTitle}
              subtitle={t.securitySubtitleMain}
              targetPasscode={MAIN_PASSCODE}
              onSuccess={handleMainUnlock}
            />
          </motion.div>
        )}

        {screen !== 'lock' && (
          <motion.div 
            key="app" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="pb-32"
          >
            <TopBar title={t.ourStory} avatarUrl={profile.avatarUrl} />
            
            {screen === 'timeline' && <TimelineScreen memories={memories} t={t} lang={lang} />}
            
            {screen === 'add' && (
              isAddLocked ? (
                <PasscodeScreen 
                  title={t.securityTitle}
                  subtitle={t.securitySubtitleAdd}
                  targetPasscode={ADD_PASSCODE}
                  onSuccess={handleAddUnlock}
                  onCancel={() => setScreen('timeline')}
                />
              ) : (
                <AddMemoryScreen t={t} />
              )
            )}
            
            {screen === 'album' && <AlbumScreen memories={memories} t={t} />}
            {screen === 'settings' && (
              <SettingsScreen 
                onLogout={handleLogout} 
                lang={lang} 
                onLanguageChange={handleLanguageChange}
                t={t}
              />
            )}

            <BottomNav activeScreen={screen} onNavigate={navigateTo} t={t} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
