import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MemoryCard } from '../components/MemoryCard';
import { RisingHearts } from '../components/RisingHearts';
import { Memory, UserProfile } from '../types';
import { Language } from '../utils/i18n';
import { useColumnCount, toColumns } from '../utils/useColumnCount';
import { calculateDaysAgo, calculateDaysUntilAnniversary } from '../utils/date';
import { isVideoUrl } from '../utils/media';
import { Thumb } from '../components/MediaImage';
import { ChevronDown, Heart, PenLine, CalendarHeart, Sparkles } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

// The hero counts up only on the first visit of a session, not every time we come back from a memory
let heroHasCounted = false;

const useCountUp = (target: number, duration = 1600) => {
  const [value, setValue] = useState(heroHasCounted ? target : 0);
  useEffect(() => {
    if (heroHasCounted || target === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    heroHasCounted = true;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
};

const PolaroidFan = ({ images }: { images: string[] }) => {
  const poses = [
    { r: -9, x: '-38%', y: 18, z: 1 },
    { r: 7, x: '38%', y: 10, z: 2 },
    { r: -2, x: '0%', y: 0, z: 3 },
  ];
  const shown = images.slice(0, 3);
  const offset = poses.length - shown.length;

  return (
    <div className="relative h-[210px] sm:h-[300px] lg:h-[380px] w-full max-w-[340px] sm:max-w-[460px] mx-auto">
      {shown.map((src, i) => {
        const pose = poses[i + offset];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{ opacity: 1, y: pose.y, rotate: pose.r }}
            transition={{ duration: 1, delay: 0.35 + i * 0.12, ease: EASE }}
            className="absolute left-1/2 top-0 w-[42%] sm:w-[46%]"
            style={{ x: `calc(-50% + ${pose.x})`, zIndex: pose.z }}
          >
            <div className="animate-float bg-white p-2 pb-8 sm:p-2.5 sm:pb-10 rounded-[6px] shadow-[0_2px_4px_rgba(60,30,30,0.06),0_24px_40px_-18px_rgba(110,42,49,0.45)]" style={{ animationDelay: `${i * 0.8}s` }}>
              <div className="aspect-[4/5] overflow-hidden rounded-[3px] bg-paper-deep">
                {isVideoUrl(src) ? (
                  <video src={`${src}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <Thumb src={src} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const EmptyHeartsArt = () => (
  <svg viewBox="0 0 240 120" className="w-56 h-28" aria-hidden>
    <path d="M28 78 C 70 120, 110 20, 120 64 S 175 110, 212 70" fill="none" stroke="#c2575f" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" />
    <path d="M38 52c-6-9-22-6-20 7 1 9 14 17 20 22 6-5 19-13 20-22 2-13-14-16-20-7z" fill="#e6878d" />
    <path d="M202 46c-6-9-22-6-20 7 1 9 14 17 20 22 6-5 19-13 20-22 2-13-14-16-20-7z" fill="#c2575f" />
  </svg>
);

export const TimelineScreen = ({ memories, profile, t, lang, onSelectMemory, onAdd, onProfile }: {
  memories: Memory[],
  profile?: UserProfile | null,
  t: any,
  lang: Language,
  onSelectMemory: (m: Memory) => void,
  onAdd: () => void,
  onProfile: () => void,
}) => {
  const [displayCount, setDisplayCount] = React.useState(10);
  const columnCount = useColumnCount([[1280, 3], [768, 2]]);
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedMemories = sortedMemories.slice(0, displayCount);

  const startDate = profile?.anniversaryDate || (sortedMemories.length ? sortedMemories[sortedMemories.length - 1].date : '');
  const totalDays = startDate ? calculateDaysAgo(startDate) : 0;
  const daysTogether = useCountUp(totalDays);
  const daysToAnniversary = profile?.anniversaryDate ? calculateDaysUntilAnniversary(profile.anniversaryDate) : null;

  // Celebrate the yearly anniversary, and every 100th day together
  const yearsTogether = profile?.anniversaryDate ? new Date().getFullYear() - Number(profile.anniversaryDate.slice(0, 4)) : 0;
  const celebration =
    daysToAnniversary === 0 && yearsTogether > 0 ? t.celebrateYears.replace('{n}', String(yearsTogether))
    : totalDays > 0 && totalDays % 100 === 0 ? t.celebrateDays.replace('{n}', String(totalDays))
    : null;
  const photoCount = memories.reduce((n, m) => n + (m.images?.length || 0), 0);
  const heroImages = sortedMemories.flatMap(m => m.images || []).filter(src => !isVideoUrl(src)).slice(0, 3);

  const formatDate = (dateStr: string) => {
    if (lang === 'zh') {
      const parts = dateStr.split('-');
      return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
    }
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const sinceLabel = startDate ? `Since ${startDate.replace(/-/g, ' · ')}` : 'Love Story';
  const nameA = profile?.name || t.me;
  const nameB = profile?.partnerName || t.you;

  const columns = toColumns(displayedMemories, columnCount);

  const stats: { value: React.ReactNode; label: string; unit?: string }[] = [
    { value: memories.length, label: t.memoriesCount },
    { value: photoCount, label: t.photosCount },
    ...(daysToAnniversary !== null
      ? [daysToAnniversary === 0
        ? { value: <Heart size={20} className="inline text-rose fill-rose animate-heartbeat" />, label: t.anniversaryToday }
        : { value: daysToAnniversary, label: t.nextAnniversary, unit: t.daysUnit }]
      : []),
  ];

  return (
    <main className="pt-24 sm:pt-28 pb-36 px-5 sm:px-8 max-w-6xl mx-auto">
      {/* Hero: days together */}
      <section className={`relative grid items-center gap-8 lg:gap-12 ${heroImages.length ? 'lg:grid-cols-[1.1fr_1fr]' : ''} mb-14 sm:mb-20`}>
        {celebration && (
          <div className="absolute -inset-x-5 sm:-inset-x-8 -top-24 sm:-top-28 bottom-0 overflow-hidden pointer-events-none">
            <RisingHearts speed={1.6} opacity={1.4} />
          </div>
        )}
        <div className={`relative text-center ${heroImages.length ? 'lg:text-left' : ''}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
            className="eyebrow"
          >
            {sinceLabel}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className={`mt-4 flex items-center justify-center ${heroImages.length ? 'lg:justify-start' : ''} gap-3 font-body text-[17px] text-ink-soft`}
          >
            <span>{nameA}</span>
            <span className="h-px w-8 bg-rose/40" />
            <Heart size={14} className="text-rose fill-rose" />
            <span className="h-px w-8 bg-rose/40" />
            <span>{nameB}</span>
          </motion.div>

          {startDate ? (
            <>
              {celebration ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
                  className="mt-6 inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-body text-[15px] font-semibold text-rose"
                >
                  <Sparkles size={16} />
                  {celebration}
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.15 }}
                  className="mt-6 font-body text-[15px] text-ink-soft"
                >
                  {t.together}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: EASE }}
                className={`mt-1 flex items-end justify-center ${heroImages.length ? 'lg:justify-start' : ''} gap-2`}
              >
                <span className="font-headline italic font-light text-rose-ink leading-[0.9] tracking-[-0.04em] text-[clamp(96px,30vw,176px)] tabular-nums pr-2">
                  {daysTogether}
                </span>
                <span className="flex flex-col items-center gap-2 pb-[0.6em] text-[22px]">
                  <Heart size={22} className="text-rose fill-rose animate-heartbeat" />
                  <span className="font-body text-ink">{t.daysUnit}</span>
                </span>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: EASE }}
              className="mt-8"
            >
              <p className="font-body text-[clamp(24px,6.4vw,40px)] leading-[1.45] text-ink max-w-xl mx-auto text-balance">
                {t.quote.replace(/["“”]/g, '')}
              </p>
              <button onClick={onProfile} className="btn-soft mt-6">
                <CalendarHeart size={16} />
                {t.setAnniversary}
              </button>
            </motion.div>
          )}

          {memories.length > 0 && (
            <motion.dl
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
              className={`mt-8 inline-flex items-stretch rounded-[22px] glass divide-x divide-ink/[0.07]`}
            >
              {stats.map((s, i) => (
                <div key={i} className="px-4 sm:px-6 py-3 text-center min-w-[84px]">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-headline text-[24px] leading-none text-ink tabular-nums">
                    {s.value}
                    {s.unit && <span className="ml-0.5 font-body text-[12px] text-ink-soft">{s.unit}</span>}
                  </dd>
                  <dd className="mt-1.5 font-label text-[10.5px] font-medium text-muted whitespace-nowrap">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        {heroImages.length > 0 && <PolaroidFan images={heroImages} />}
      </section>

      {memories.length === 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="paper-card max-w-lg mx-auto px-6 py-10 flex flex-col items-center text-center"
        >
          <EmptyHeartsArt />
          <h2 className="mt-4 font-body font-semibold text-[22px] text-ink">{t.emptyTitle}</h2>
          <p className="mt-3 font-body text-[15px] leading-[1.8] text-ink-soft max-w-xs">{t.emptySubtitle}</p>
          <button onClick={onAdd} className="btn-primary mt-8">
            <PenLine size={18} />
            {t.startWriting}
          </button>
        </motion.section>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-body font-semibold text-[20px] text-ink whitespace-nowrap">{t.latest}</h2>
            <span className="h-px flex-1 bg-gradient-to-r from-rose/30 to-transparent" />
          </div>

          <div className="flex gap-6 items-start">
            {columns.map((col, c) => (
              <div key={c} className={`flex-1 min-w-0 flex flex-col gap-8 relative ${columnCount === 1 ? 'pl-7' : ''}`}>
                {columnCount === 1 && (
                  <span aria-hidden className="absolute left-[7px] top-2 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-rose/55 via-rose/25 to-transparent" />
                )}
                {col.map((memory) => (
                  <motion.article
                    key={memory.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="relative"
                  >
                    {columnCount === 1 && (
                      <span aria-hidden className="absolute -left-7 top-5 w-4 h-4 rounded-full bg-paper flex items-center justify-center">
                        <Heart size={14} className="text-rose fill-rose" />
                      </span>
                    )}
                    <MemoryCard memory={memory} index={0} t={t} formatDate={formatDate} onClick={() => onSelectMemory(memory)} />
                  </motion.article>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {displayCount < sortedMemories.length && (
        <div className="mt-16 text-center">
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="btn-soft"
          >
            {t.loadMore}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </main>
  );
};
