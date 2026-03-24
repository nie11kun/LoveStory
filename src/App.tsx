import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Memory, UserProfile } from './types';
import { Language, translations } from './utils/i18n';
import { MAIN_PASSCODE, ADD_PASSCODE, UNLOCK_EXPIRY_MS } from './utils/constants';
import { Music, Pause } from 'lucide-react';

import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { PasscodeScreen } from './components/PasscodeScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { MemoryDetailScreen } from './screens/MemoryDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MemoryFormScreen } from './screens/MemoryFormScreen';
import { AlbumScreen } from './screens/AlbumScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [isAddLocked, setIsAddLocked] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit'|'delete'|'add'|'profile', memory?: Memory } | null>(null);

  const attemptProfile = () => {
    if (isAddLocked) {
      setPendingAction({ type: 'profile' });
      setScreen('passcode_verify');
    } else {
      setScreen('profile');
    }
  };

  const attemptEdit = (m: Memory) => {
    if (isAddLocked) {
      setPendingAction({ type: 'edit', memory: m });
      setScreen('passcode_verify');
    } else {
      setActiveMemory(m);
      setScreen('edit');
    }
  };

  const attemptDelete = (m: Memory) => {
    if (isAddLocked) {
      setPendingAction({ type: 'delete', memory: m });
      setScreen('passcode_verify');
    } else {
      executeDelete(m.id);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
        setScreen('timeline');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    return (saved as Language) || 'zh';
  });

  const t = translations[lang];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, memoriesRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/memories')
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (memoriesRes.ok) setMemories(await memoriesRes.json());
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (profile?.bgmUrl && audioRef.current && screen !== 'lock') {
      audioRef.current.play().then(() => setIsPlayingBgm(true)).catch(() => {
        console.log("Autoplay blocked by browser policy, waiting for interaction.");
      });
    }
  }, [profile?.bgmUrl, screen]);

  const toggleBgm = () => {
    if (audioRef.current) {
      if (isPlayingBgm) {
        audioRef.current.pause();
        setIsPlayingBgm(false);
      } else {
        audioRef.current.play();
        setIsPlayingBgm(true);
      }
    }
  };

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
    
    if (pendingAction?.type === 'edit' && pendingAction.memory) {
      setActiveMemory(pendingAction.memory);
      setScreen('edit');
    } else if (pendingAction?.type === 'delete' && pendingAction.memory) {
      executeDelete(pendingAction.memory.id);
    } else if (pendingAction?.type === 'profile') {
      setScreen('profile');
    } else {
      setScreen('add');
    }
    setPendingAction(null);
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

  // Scroll Restoration Logic
  const scrollPositions = React.useRef<Record<string, number>>({});

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[screen] = window.scrollY;
    };
    
    // As soon as the screen changes, we restore its last known scroll position
    // We use setTimeout to ensure React has swapped the DOM nodes first
    setTimeout(() => {
      const pos = scrollPositions.current[screen] || 0;
      window.scrollTo({ top: pos, behavior: 'instant' });
    }, 0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [screen]);

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
            <TopBar title={t.ourStory} avatarUrl={profile?.avatarUrl} onClickAvatar={attemptProfile} />
            
            {screen === 'timeline' && (
              <TimelineScreen 
                memories={memories} 
                t={t} 
                lang={lang} 
                onSelectMemory={(m) => { setActiveMemory(m); setScreen('detail'); }} 
              />
            )}
            
            {screen === 'detail' && activeMemory && (
              <MemoryDetailScreen
                memory={activeMemory}
                onBack={() => setScreen('timeline')}
                onEdit={attemptEdit}
                onDelete={(id) => attemptDelete(activeMemory)}
                t={t}
                lang={lang}
              />
            )}

            {screen === 'passcode_verify' && (
              <PasscodeScreen 
                title={t.securityTitle}
                subtitle={t.securitySubtitleAdd}
                targetPasscode={ADD_PASSCODE}
                onSuccess={handleAddUnlock}
                onCancel={() => {
                  setPendingAction(null);
                  setScreen('timeline');
                }}
              />
            )}

            {screen === 'profile' && (
              <ProfileScreen 
                profile={profile} 
                onSave={(p) => { setProfile(p); setScreen('timeline'); }} 
                onBack={() => setScreen('timeline')} 
                t={t} 
              />
            )}

            {(screen === 'add' || screen === 'edit') && (
              isAddLocked && screen === 'add' ? (
                <PasscodeScreen 
                  title={t.securityTitle}
                  subtitle={t.securitySubtitleAdd}
                  targetPasscode={ADD_PASSCODE}
                  onSuccess={handleAddUnlock}
                  onCancel={() => setScreen('timeline')}
                />
              ) : (
                <MemoryFormScreen 
                  t={t} 
                  initialMemory={screen === 'edit' ? (activeMemory || undefined) : undefined}
                  profile={profile}
                  onUpdateProfile={setProfile}
                  onSave={(m) => {
                    if (screen === 'edit') {
                      setMemories(prev => prev.map(old => old.id === m.id ? m : old));
                    } else {
                      setMemories([...memories, m]);
                    }
                  }} 
                  onNavigate={navigateTo} 
                />
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

            {profile?.bgmUrl && screen !== 'lock' && (
              <>
                <audio ref={audioRef} src={profile.bgmUrl} loop />
                <button 
                  onClick={toggleBgm}
                  className="fixed right-6 bottom-24 z-[90] w-12 h-12 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-full shadow-lg border border-outline-variant/20 hover:scale-110 active:scale-95 transition-all group"
                >
                  {isPlayingBgm ? (
                    <Pause size={20} className="text-primary" />
                  ) : (
                    <Music size={20} className="text-secondary group-hover:text-primary transition-colors" />
                  )}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
