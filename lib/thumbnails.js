import sharp from 'sharp';

// Keep memory and CPU low on a small server: no in-memory image cache, one worker thread
sharp.cache(false);
sharp.concurrency(1);

// Media keys are content hashes (media/<md5>.<ext>), so objects never change and can be cached forever
export const MEDIA_CACHE_CONTROL = 'public, max-age=31536000, immutable';

export const THUMB_WIDTH = 1200;
export const THUMB_QUALITY = 78;

// Animated GIFs and formats sharp can't decode keep using the original
const THUMBNAILABLE = /^media\/([0-9a-f]{32})\.(jpe?g|png|webp)$/i;

/**
 * The thumbnail key for an original media key, or null if it doesn't get one.
 * Keep in sync with thumbUrl() in src/utils/media.ts.
 * @param key An object key such as 'media/0123abcd....jpg'.
 */
export const thumbKeyFor = (key) => {
  const match = THUMBNAILABLE.exec(key);
  return match ? `media/thumbs/${match[1]}.webp` : null;
};

/**
 * Resizes an image to a web-friendly WebP, honouring EXIF rotation.
 * @param input A file path or a Buffer of the original image.
 * @returns The thumbnail bytes.
 */
export const createThumbnail = (input) =>
  sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer();
