import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Screen, Memory, UserProfile } from '../types';

export const MemoryFormScreen = ({ t, onSave, onNavigate, initialMemory, profile, onUpdateProfile }: { t: any, onSave: (m: Memory) => void, onNavigate: (s: Screen) => void, initialMemory?: Memory, profile?: UserProfile | null, onUpdateProfile?: (p: UserProfile) => void }) => {
  const [title, setTitle] = useState(initialMemory?.title || '');
  const [story, setStory] = useState(initialMemory?.description || '');
  const [date, setDate] = useState(initialMemory?.date || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedTags, setSelectedTags] = useState<string[]>(initialMemory?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const allAvailableTags = profile?.customTags || [];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddNewTag = async () => {
    const trimmed = newTagInput.trim();
    const currentProfile = profile || {} as UserProfile;
    if (trimmed && !allAvailableTags.includes(trimmed)) {
      const updatedProfile = { ...currentProfile, customTags: [...allAvailableTags, trimmed] };
      try {
        const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProfile) });
        if (res.ok) {
          const newProf = await res.json();
          if (onUpdateProfile) onUpdateProfile(newProf);
          setSelectedTags(prev => [...prev, trimmed]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [networkUrls, setNetworkUrls] = useState<string[]>(initialMemory?.images || []);
  const [networkInput, setNetworkInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLocalFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const addNetworkUrl = () => {
    if (networkInput && networkInput.startsWith('http')) {
      setNetworkUrls(prev => [...prev, networkInput]);
      setNetworkInput('');
    }
  };

  const removeLocalFile = (index: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeNetworkUrl = (index: number) => {
    setNetworkUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story || !date) return;
    setIsSubmitting(true);
    let finalMediaUrls = [...networkUrls];

    try {
      if (localFiles.length > 0) {
        const formData = new FormData();
        localFiles.forEach(file => formData.append('files', file));
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const { urls } = await uploadRes.json();
          finalMediaUrls = [...finalMediaUrls, ...urls];
        } else {
          console.error("Upload failed");
        }
      }

      if (finalMediaUrls.length === 0) {
        finalMediaUrls = [];
      }

      const url = initialMemory ? `/api/memories/${initialMemory.id}` : '/api/memories';
      const method = initialMemory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description: story,
          date,
          images: finalMediaUrls,
          tags: selectedTags
        })
      });
      if (res.ok) {
        const memoryData = await res.json();
        onSave(memoryData);
        onNavigate('timeline');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <main className="pt-24 pb-32 px-6 max-w-screen-md mx-auto animate-fade-in">
    <section className="mb-12">
      <h2 className="font-headline text-4xl text-on-surface mb-2 italic">{initialMemory ? t.editMemory : t.captureMoment}</h2>
      <p className="text-on-surface-variant font-body">{t.addDescription}</p>
    </section>

    <form className="space-y-10" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="font-body text-sm uppercase tracking-widest text-secondary block ml-1">{t.addMedia}</label>
        
        <div className="grid grid-cols-3 gap-4">
          {networkUrls.map((url, i) => (
            <div key={'net'+i} className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm relative group">
              {url.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={url} className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => removeNetworkUrl(i)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
            </div>
          ))}
          {localFiles.map((file, i) => (
            <div key={'loc'+i} className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm relative group">
              {file.type.startsWith('video/') ? (
                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
              ) : (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => removeLocalFile(i)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
            </div>
          ))}

          <label className="aspect-square cursor-pointer rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline transition-all hover:bg-surface-container-low hover:border-primary/40 group relative overflow-hidden">
            <input type="file" multiple accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            <Plus size={32} className="group-hover:scale-110 transition-transform" />
            <span className="font-body text-[10px] mt-1 opacity-60">本地上传</span>
          </label>
        </div>
        
        <div className="mt-4 flex gap-2">
          <input 
            type="url" 
            placeholder="粘贴网络图片/视频URL" 
            className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container/30 text-on-surface"
            value={networkInput}
            onChange={(e) => setNetworkInput(e.target.value)}
          />
          <button type="button" onClick={addNetworkUrl} className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-body text-sm hover:bg-primary/20 transition-colors whitespace-nowrap">
            添加网络媒体
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-secondary ml-1">{t.title}</label>
        <input 
          className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container/30 font-headline text-xl italic" 
          placeholder={t.titlePlaceholder} 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-secondary ml-1">{t.story}</label>
        <textarea 
          className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface-variant placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container/30 font-body leading-relaxed" 
          placeholder={t.storyPlaceholder} 
          rows={6}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.date}</label>
          <div className="relative">
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary-container/30 font-body" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-secondary ml-1">{t.tags}</label>
          <div className="flex flex-wrap gap-2 pt-1 items-center">
            {allAvailableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button 
                  key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-body transition-colors ${isActive ? 'bg-primary-container/20 border border-primary/20 text-primary font-bold' : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-primary-container hover:text-white'}`}
                >
                  {tag}
                </button>
              );
            })}
            
            {isAddingTag ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" autoFocus value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTag(); } }}
                  placeholder={t.newTagPlaceholder}
                  className="bg-white border border-outline-variant/20 rounded-full px-3 py-1.5 text-xs font-body text-on-surface focus:outline-none focus:border-primary w-28"
                />
                <button type="button" onClick={handleAddNewTag} className="text-primary hover:text-primary-container">
                  <Plus size={16} />
                </button>
                <button type="button" onClick={() => setIsAddingTag(false)} className="text-outline hover:text-secondary">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsAddingTag(true)} className="w-8 h-8 flex items-center justify-center bg-surface-container-high rounded-full text-outline hover:text-primary transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col items-center">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto md:min-w-[280px] h-14 bg-gradient-to-r from-primary to-primary-container text-white font-body font-bold text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? '...' : (initialMemory ? t.saveChanges : t.save)}
        </button>
        <p className="mt-4 text-[10px] font-body uppercase tracking-widest text-outline/60">{t.eternity}</p>
      </div>
    </form>
  </main>
  );
};
