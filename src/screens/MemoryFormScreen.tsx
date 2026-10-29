import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Screen, Memory, UserProfile } from '../types';
import { showToast } from '../components/Toast';
import { Thumb } from '../components/MediaImage';

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
        } else {
          showToast(t.tagSaveFailed);
        }
      } catch (e) {
        console.error(e);
        showToast(t.tagSaveFailed);
      }
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const [localFiles, setLocalFiles] = useState<File[]>([]);

  // One preview URL per file, released when the file list changes or the form closes
  const localPreviews = useMemo(() => localFiles.map(file => URL.createObjectURL(file)), [localFiles]);
  useEffect(() => () => localPreviews.forEach(url => URL.revokeObjectURL(url)), [localPreviews]);
  const [networkUrls, setNetworkUrls] = useState<string[]>(initialMemory?.images || []);
  const [networkInput, setNetworkInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLocalFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const addNetworkUrl = () => {
    const trimmed = networkInput.trim();
    if (!trimmed) return;
    if (/^https?:\/\//i.test(trimmed)) {
      setNetworkUrls(prev => [...prev, trimmed]);
      setNetworkInput('');
    } else {
      showToast(t.invalidUrl);
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
          // Stop here rather than saving the memory without its photos; the files stay in the form for a retry
          console.error("Upload failed");
          showToast(t.uploadFailed);
          return;
        }
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
      } else {
        showToast(t.saveFailed);
      }
    } catch (error) {
      console.error(error);
      showToast(t.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <main className="pt-24 sm:pt-28 pb-36 px-5 max-w-2xl mx-auto animate-fade-in">
    <section className="mb-12">
      <h2 className="font-body font-semibold text-[32px] sm:text-[38px] tracking-tight text-ink mb-2">{initialMemory ? t.editMemory : t.captureMoment}</h2>
      <p className="text-ink-soft font-body text-[15px]">{t.addDescription}</p>
    </section>

    <form className="space-y-10" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="field-label">{t.addMedia}</label>
        
        <div className="grid grid-cols-3 gap-4">
          {networkUrls.map((url, i) => (
            <div key={'net'+i} className="aspect-square bg-paper-deep rounded-2xl overflow-hidden shadow-[0_10px_24px_-16px_rgba(110,42,49,0.45)] relative group">
              {url.match(/\.(mp4|webm|ogg|mov|m4v|hevc|h265)$/i) ? (
                <video src={`${url}#t=0.1`} preload="metadata" playsInline controls className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
              ) : (
                <Thumb src={url} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => removeNetworkUrl(i)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><X size={14}/></button>
            </div>
          ))}
          {localFiles.map((file, i) => (
            <div key={'loc'+i} className="aspect-square bg-paper-deep rounded-2xl overflow-hidden shadow-[0_10px_24px_-16px_rgba(110,42,49,0.45)] relative group">
              {file.type.startsWith('video/') ? (
                <video src={`${localPreviews[i]}#t=0.1`} preload="metadata" playsInline controls className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
              ) : (
                <img src={localPreviews[i]} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => removeLocalFile(i)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><X size={14}/></button>
            </div>
          ))}

          <label className="aspect-square cursor-pointer rounded-2xl border-[1.5px] border-dashed border-rose/35 bg-blush/40 flex flex-col items-center justify-center text-rose transition-all hover:bg-blush hover:border-rose/60 group relative overflow-hidden">
            <input type="file" multiple accept="image/*,video/*,.hevc,.h265,.mov,.mp4" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            <Plus size={28} className="group-hover:scale-110 transition-transform" />
            <span className="font-label text-[11px] font-semibold mt-1">{t.localUpload}</span>
          </label>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input 
            type="url" 
            placeholder={t.mediaUrlPlaceholder} 
            className="field flex-1 min-w-0 appearance-none"
            value={networkInput}
            onChange={(e) => setNetworkInput(e.target.value)}
          />
          <button type="button" onClick={addNetworkUrl} className="btn-soft w-full sm:w-auto whitespace-nowrap">
            {t.addNetworkMedia}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="field-label">{t.title}</label>
        <input 
          className="field font-body text-[18px] font-semibold" 
          placeholder={t.titlePlaceholder} 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="field-label">{t.story}</label>
        <textarea 
          className="field font-body leading-[1.85] resize-y" 
          placeholder={t.storyPlaceholder} 
          rows={6}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="field-label">{t.date}</label>
          <div className="relative">
            <input 
              className="field flex-1 min-w-0 appearance-none font-body" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="field-label">{t.tags}</label>
          <div className="flex flex-wrap gap-2 pt-1 items-center">
            {allAvailableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button 
                  key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-[13px] font-label font-medium transition-all ${isActive ? 'bg-rose text-white border border-rose shadow-[0_6px_14px_-8px_rgba(158,63,72,0.7)]' : 'bg-white border border-ink/10 text-ink-soft hover:border-rose/40 hover:text-rose'}`}
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
              <button type="button" onClick={() => setIsAddingTag(true)} className="w-8 h-8 flex items-center justify-center bg-white border border-dashed border-rose/40 rounded-full text-rose hover:bg-blush transition-colors">
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
          className="btn-primary w-full md:w-auto md:min-w-[280px] text-[16px]"
        >
          {isSubmitting ? '...' : (initialMemory ? t.saveChanges : t.save)}
        </button>
        <p className="mt-4 font-label text-[11px] tracking-[0.2em] uppercase text-muted">{t.eternity}</p>
      </div>
    </form>
  </main>
  );
};
