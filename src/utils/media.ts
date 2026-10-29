export const isVideoUrl = (url: string): boolean => /\.(mp4|webm|ogg|mov|m4v|hevc|h265)(\?|#|$)/i.test(url);

// R2 originals live at <domain>/media/<md5>.<ext>; the server writes a WebP thumbnail to <domain>/media/thumbs/<md5>.webp.
// Keep in sync with thumbKeyFor() in lib/thumbnails.js.
const THUMBNAILABLE = /^(.*\/media\/)([0-9a-f]{32})\.(jpe?g|png|webp)$/i;

/** The thumbnail URL for an uploaded photo, or null when it has none (videos, GIFs, external links). */
export const thumbUrl = (url: string): string | null => {
  const match = THUMBNAILABLE.exec(url);
  return match ? `${match[1]}thumbs/${match[2]}.webp` : null;
};
