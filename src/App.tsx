import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Memory, UserProfile } from './types';
import { Language, translations } from './utils/i18n';
import { MAIN_PASSCODE, ADD_PASSCODE, UNLOCK_EXPIRY_MS } from './utils/constants';

import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { PasscodeScreen } from './components/PasscodeScreen';
import { Toaster, showToast } from './components/Toast';
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
    setPendingAction({ type: 'delete', memory: m });
    setScreen('passcode_verify');
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
        setScreen('timeline');
        return;
      }
    } catch (e) {
      console.error(e);
    }
    // Leave the passcode screen and return to the memory so the user isn't stranded
    showToast(t.deleteFailed);
    setScreen('detail');
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
        else showToast(t.loadFailed);
      } catch (error) {
        console.error('Failed to fetch data', error);
        showToast(t.loadFailed);
      }
    };
    fetchData();
  }, []);

  const userPausedBgm = React.useRef(false);
  const bgmInitialized = React.useRef(false);

  useEffect(() => {
    if (!profile?.bgmUrl || !audioRef.current || screen === 'lock' || bgmInitialized.current || userPausedBgm.current) return;

    const tryPlay = () => {
      if (audioRef.current && !bgmInitialized.current && !userPausedBgm.current) {
        audioRef.current.play().then(() => {
          setIsPlayingBgm(true);
          bgmInitialized.current = true;
        }).catch(() => {});
      }
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };

    // Try immediately first
    audioRef.current.play().then(() => {
      setIsPlayingBgm(true);
      bgmInitialized.current = true;
    }).catch(() => {
      // Blocked by browser policy — wait for first user interaction
      document.addEventListener('click', tryPlay, { once: true });
      document.addEventListener('touchstart', tryPlay, { once: true });
    });

    return () => {
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };
  }, [profile?.bgmUrl, screen]);

  const toggleBgm = () => {
    if (audioRef.current) {
      if (isPlayingBgm) {
        audioRef.current.pause();
        setIsPlayingBgm(false);
        userPausedBgm.current = true;
      } else {
        userPausedBgm.current = false;
        audioRef.current.play().then(() => setIsPlayingBgm(true)).catch(() => setIsPlayingBgm(false));
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
    <div className="min-h-screen text-ink font-body">
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
            className=""
          >
            <TopBar
              title={t.ourStory}
              avatarUrl={profile?.avatarUrl}
              onClickAvatar={attemptProfile}
              hasMusic={!!profile?.bgmUrl}
              isPlaying={isPlayingBgm}
              onToggleMusic={toggleBgm}
            />
            
            {screen === 'timeline' && (
              <TimelineScreen 
                memories={memories} 
                profile={profile}
                t={t} 
                lang={lang} 
                onSelectMemory={(m) => { setActiveMemory(m); setScreen('detail'); }} 
                onAdd={() => setScreen('add')}
                onProfile={attemptProfile}
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

            <BottomNav activeScreen={screen} onNavigate={navigateTo} onProfile={attemptProfile} t={t} />

            {profile?.bgmUrl && <audio ref={audioRef} src={profile.bgmUrl} loop />}
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster dismissLabel={t.dismiss} />
    </div>
  );
}
