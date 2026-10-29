import React, { useState } from 'react';
import { Upload, Calendar, X, Plus, ChevronRight, Loader2, Music, Camera, Heart } from 'lucide-react';
import { UserProfile } from '../types';
import { showToast } from '../components/Toast';

export const ProfileScreen = ({ profile, onSave, onBack, t }: { profile?: UserProfile | null, onSave: (p: UserProfile) => void, onBack: () => void, t: any }) => {
  const initialTags = profile?.customTags || [];

  const [name, setName] = useState(profile?.name || '');
  const [partnerName, setPartnerName] = useState(profile?.partnerName || '');
  const [anniversaryDate, setAnniversaryDate] = useState(profile?.anniversaryDate || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [bgmUrl, setBgmUrl] = useState('');
  const [customTags, setCustomTags] = useState<string[]>(initialTags);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBgm, setIsUploadingBgm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('files', input.files[0]);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const { urls } = await res.json();
          if (urls.length > 0) setAvatarUrl(urls[0]);
        } else {
          showToast(t.uploadFailed);
        }
      } catch (err) {
        console.error(err);
        showToast(t.uploadFailed);
      } finally {
        setIsUploadingAvatar(false);
        // Allow picking the same file again after a failure
        input.value = '';
      }
    }
  };

  const bgmFileRef = React.useRef<HTMLInputElement>(null);

  const handleBgmChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingBgm(true);
      const formData = new FormData();
      formData.append('files', e.target.files[0]);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const { urls } = await res.json();
          if (urls.length > 0) setBgmUrl(urls[0]);
        } else {
          showToast(t.uploadFailed);
        }
      } catch (err) {
        console.error(err);
        showToast(t.uploadFailed);
      } finally {
        setIsUploadingBgm(false);
      }
    }
  };

  const handleBgmButtonClick = () => {
    if (isUploadingBgm) return;
    const trimmedUrl = bgmUrl.trim();
    if (trimmedUrl && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
      // Network URL already pasted, use it directly via upload to R2
      setIsUploadingBgm(true);
      fetch(trimmedUrl)
        .then(r => {
          if (!r.ok) throw new Error(`Download failed: ${r.status}`);
          return r.blob();
        })
        // Downloading usually fails on CORS, so tell the user to upload the file instead
        .catch(err => { showToast(t.bgmLinkFailed); throw err; })
        .then(blob => {
          const formData = new FormData();
          const ext = trimmedUrl.split('.').pop()?.split('?')[0] || 'mp3';
          formData.append('files', blob, `network-bgm.${ext}`);
          return fetch('/api/upload', { method: 'POST', body: formData }).then(res => {
            if (!res.ok) {
              showToast(t.uploadFailed);
              throw new Error(`Upload failed: ${res.status}`);
            }
            return res.json();
          });
        })
        .then(({ urls }) => { if (urls?.length > 0) setBgmUrl(urls[0]); })
        .catch(err => console.error('Network BGM upload failed:', err))
        .finally(() => setIsUploadingBgm(false));
    } else {
      // No URL, open local file picker
      bgmFileRef.current?.click();
    }
  };

  const getBgmDisplayName = (url: string) => {
    if (!url) return '';
    try {
      const name = decodeURIComponent(url.split('/').pop() || '');
      // Remove hash prefix if present (e.g. "a1b2c3d4e5.mp3" -> keep as is)
      return name.length > 40 ? name.slice(0, 37) + '...' : name;
    } catch { return url.split('/').pop() || ''; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedProfile = { ...profile, name, partnerName, anniversaryDate, avatarUrl, bgmUrl: bgmUrl || profile?.bgmUrl || '', customTags };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        onSave(await res.json());
      } else {
        showToast(t.saveFailed);
      }
    } catch (err) {
      console.error(err);
      showToast(t.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags(prev => [...prev, trimmed]);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  return (
    <main className="pt-24 sm:pt-28 pb-36 px-5 max-w-2xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="glass h-10 pl-2 pr-4 rounded-full text-ink-soft hover:text-rose transition-colors flex items-center">
          <ChevronRight className="rotate-180" size={24} />
          <span className="font-label text-[13px] font-semibold">{t.timeline}</span>
        </button>
      </div>
      
      <section className="mb-12">
        <h2 className="font-body font-semibold text-[32px] sm:text-[38px] tracking-tight text-ink mb-2">{t.profile}</h2>
      </section>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <label className="relative cursor-pointer group rounded-full" aria-label={t.upload}>
            <span className="block w-32 h-32 rounded-full ring-4 ring-white overflow-hidden shadow-[0_18px_40px_-16px_rgba(110,42,49,0.5)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-blush text-rose"><Heart size={34} className="fill-rose/80" /></span>
              )}
              {isUploadingAvatar && (
                <span className="absolute inset-0 rounded-full flex items-center justify-center bg-black/35 text-white">
                  <Loader2 size={26} className="animate-spin" />
                </span>
              )}
            </span>
            {/* Always visible so touch screens (no hover) know the avatar can be changed */}
            <span className="absolute bottom-0.5 right-0.5 w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#d6707a] to-[#a8434c] ring-4 ring-paper shadow-[0_8px_16px_-6px_rgba(158,63,72,0.6)] group-hover:scale-110 transition-transform">
              <Camera size={17} />
            </span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
          </label>
          <span className="eyebrow">{t.avatar}</span>
        </div>

        <div className="space-y-2">
          <label className="field-label">{t.name}</label>
          <input 
            className="field font-body text-[16px]" 
            type="text" value={name} onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="field-label">{t.partnerName}</label>
          <input 
            className="field font-body text-[16px]" 
            type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label className="field-label">{t.anniversaryDate}</label>
          <div className="relative">
            <input 
              className="field font-body text-[16px]" 
              type="date" value={anniversaryDate} onChange={(e) => setAnniversaryDate(e.target.value)} 
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="field-label">{t.bgm}</label>
          {profile?.bgmUrl && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blush/70 rounded-full mb-2">
              <Music size={14} className="text-primary flex-shrink-0" />
              <span className="font-body text-xs text-on-surface-variant truncate">{t.currentBgm}{getBgmDisplayName(profile.bgmUrl)}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              className="field flex-1 min-w-0 appearance-none font-body text-sm" 
              type="text" value={bgmUrl} onChange={(e) => setBgmUrl(e.target.value)} 
              placeholder={t.bgmPlaceholder}
            />
            <button 
              type="button"
              onClick={handleBgmButtonClick}
              disabled={isUploadingBgm}
              className={`w-full sm:w-auto btn-soft whitespace-nowrap ${isUploadingBgm ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
            >
              {isUploadingBgm ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Upload size={16} className="mr-2" />
              )}
              {isUploadingBgm ? t.uploading : bgmUrl.trim().startsWith('http') ? t.uploadLink : t.uploadAudio}
            </button>
            <input ref={bgmFileRef} type="file" accept="audio/*" className="hidden" onChange={handleBgmChange} disabled={isUploadingBgm} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="field-label">{t.tags}</label>
          <div className="field flex flex-wrap gap-2 items-center">
            {customTags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 bg-white border border-outline-variant/20 rounded-full px-3 py-1.5 text-xs font-body text-on-surface-variant">
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} className="text-outline hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {isAddingTag ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" autoFocus value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder={t.newTagPlaceholder}
                  className="bg-white border border-outline-variant/20 rounded-full px-3 py-1.5 text-xs font-body text-on-surface focus:outline-none focus:border-primary w-28"
                />
                <button type="button" onClick={handleAddTag} className="text-primary hover:text-primary-container">
                  <Plus size={16} />
                </button>
                <button type="button" onClick={() => setIsAddingTag(false)} className="text-outline hover:text-secondary">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsAddingTag(true)} className="w-8 h-8 flex items-center justify-center bg-white border border-outline-variant/20 rounded-full text-outline hover:text-primary transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center">
          <button 
            type="submit" disabled={isSubmitting}
            className="btn-primary w-full md:w-auto md:min-w-[280px] text-[16px]"
          >
            {isSubmitting ? '...' : t.saveProfile}
          </button>
        </div>
      </form>
    </main>
  );
};
