import React, { useState } from 'react';
import { Upload, Calendar, X, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

export const ProfileScreen = ({ profile, onSave, onBack, t }: { profile?: UserProfile | null, onSave: (p: UserProfile) => void, onBack: () => void, t: any }) => {
  const initialTags = profile?.customTags || [];

  const [name, setName] = useState(profile?.name || '');
  const [partnerName, setPartnerName] = useState(profile?.partnerName || '');
  const [anniversaryDate, setAnniversaryDate] = useState(profile?.anniversaryDate || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [bgmUrl, setBgmUrl] = useState(profile?.bgmUrl || '');
  const [customTags, setCustomTags] = useState<string[]>(initialTags);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBgm, setIsUploadingBgm] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('files', e.target.files[0]);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const { urls } = await res.json();
          if (urls.length > 0) setAvatarUrl(urls[0]);
        }
      } catch (err) { console.error(err); }
    }
  };

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
        }
      } catch (err) { console.error(err); } finally {
        setIsUploadingBgm(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedProfile = { ...profile, name, partnerName, anniversaryDate, avatarUrl, bgmUrl, customTags };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        onSave(await res.json());
      }
    } catch (err) { console.error(err); } finally {
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
    <main className="pt-24 pb-32 px-6 max-w-screen-md mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-secondary hover:text-primary transition-colors flex items-center">
          <ChevronRight className="rotate-180" size={24} />
          <span className="font-body text-sm ml-1">{t.timeline}</span>
        </button>
      </div>
      
      <section className="mb-12">
        <h2 className="font-headline text-4xl text-on-surface mb-2 italic">{t.profile}</h2>
      </section>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative w-32 h-32 rounded-full border-4 border-primary/20 overflow-hidden shadow-lg group">
            <img src={avatarUrl || "https://picsum.photos/seed/us/100/100"} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-[2px]">
              <Upload size={24} />
              <span className="text-xs font-body mt-2">{t.upload}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <span className="font-body text-sm text-secondary uppercase tracking-widest">{t.avatar}</span>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.name}</label>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body text-lg" 
            type="text" value={name} onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.partnerName}</label>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body text-lg" 
            type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.anniversaryDate}</label>
          <div className="relative">
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body text-lg" 
              type="date" value={anniversaryDate} onChange={(e) => setAnniversaryDate(e.target.value)} 
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">背景音乐 (BGM)</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              className="flex-1 w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body text-sm" 
              type="text" value={bgmUrl} onChange={(e) => setBgmUrl(e.target.value)} 
              placeholder="输入网络MP3链接，或上传本地文件"
            />
            <label className={`w-full sm:w-auto px-6 py-4 bg-primary/10 text-primary rounded-xl font-body text-sm transition-all duration-300 flex items-center justify-center whitespace-nowrap ${isUploadingBgm ? 'opacity-70 cursor-wait bg-primary/20 scale-95' : 'hover:bg-primary/20 cursor-pointer'}`}>
              {isUploadingBgm ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Upload size={16} className="mr-2" />
              )}
              {isUploadingBgm ? '上传中...' : '上传音频'}
              <input type="file" accept="audio/*" className="hidden" onChange={handleBgmChange} disabled={isUploadingBgm} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.tags}</label>
          <div className="flex flex-wrap gap-2 pt-1 items-center bg-surface-container-low p-4 rounded-xl">
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
            className="w-full md:w-auto md:min-w-[280px] h-14 bg-gradient-to-r from-primary to-primary-container text-white font-body font-bold text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? '...' : t.saveProfile}
          </button>
        </div>
      </form>
    </main>
  );
};
