/**
 * One-off backfill for media uploaded before thumbnails and cache headers existed.
 *
 * For every S3/R2 file referenced in data.json (memory photos, avatar, BGM) it:
 *   1. sets Cache-Control on the original if it is missing (metadata-only copy onto itself)
 *   2. creates the WebP thumbnail for photos that don't have one yet
 *
 * It never deletes anything. Without --apply it only prints what it would do.
 *
 * Usage (from the project folder on the server):
 *   node scripts/backfill-media.js            # preview
 *   node scripts/backfill-media.js --apply    # make the changes
 *   node scripts/backfill-media.js --apply --data /path/to/data.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { MEDIA_CACHE_CONTROL, thumbKeyFor, createThumbnail } from '../lib/thumbnails.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const dataFile = args.includes('--data') ? args[args.indexOf('--data') + 1] : path.join(ROOT, 'data.json');

const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_REGION } = process.env;
if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET_NAME || !process.env.S3_PUBLIC_DOMAIN) {
  console.error('S3_* settings are missing from .env; nothing to do.');
  process.exit(1);
}

let publicDomain = process.env.S3_PUBLIC_DOMAIN.replace(/\/$/, '');
if (!/^https?:\/\//i.test(publicDomain)) publicDomain = `https://${publicDomain}`;

const s3 = new S3Client({
  region: S3_REGION || 'auto',
  endpoint: S3_ENDPOINT,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
});

const head = async (key) => {
  try {
    return await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404 || error.name === 'NotFound') return null;
    throw error;
  }
};

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const urls = new Set([
  ...(data.memories || []).flatMap((m) => m.images || []),
  data.profile?.avatarUrl,
  data.profile?.bgmUrl,
].filter((url) => url && url.startsWith(`${publicDomain}/`)));

console.log(`${apply ? 'APPLYING' : 'PREVIEW (add --apply to make changes)'} · ${urls.size} R2 files referenced in ${dataFile}\n`);

const totals = { cacheSet: 0, thumbsCreated: 0, alreadyDone: 0, missing: 0, failed: 0 };

for (const url of urls) {
  const key = url.slice(publicDomain.length + 1);
  try {
    const original = await head(key);
    if (!original) {
      console.log(`  ! missing in bucket: ${key}`);
      totals.missing++;
      continue;
    }

    let changed = false;

    if (original.CacheControl !== MEDIA_CACHE_CONTROL) {
      console.log(`  + cache header   ${key}`);
      if (apply) {
        await s3.send(new CopyObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          CopySource: `${S3_BUCKET_NAME}/${key}`,
          MetadataDirective: 'REPLACE',
          ContentType: original.ContentType,
          Metadata: original.Metadata,
          CacheControl: MEDIA_CACHE_CONTROL,
        }));
      }
      totals.cacheSet++;
      changed = true;
    }

    const thumbKey = thumbKeyFor(key);
    if (thumbKey && !(await head(thumbKey))) {
      console.log(`  + thumbnail      ${thumbKey}  (from ${(original.ContentLength / 1024 / 1024).toFixed(1)} MB original)`);
      if (apply) {
        const object = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
        const body = await createThumbnail(Buffer.from(await object.Body.transformToByteArray()));
        await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: thumbKey, Body: body, ContentType: 'image/webp', CacheControl: MEDIA_CACHE_CONTROL }));
        console.log(`                   → ${(body.length / 1024).toFixed(0)} KB`);
      }
      totals.thumbsCreated++;
      changed = true;
    }

    if (!changed) totals.alreadyDone++;
  } catch (error) {
    console.error(`  x failed: ${key}: ${error.message}`);
    totals.failed++;
  }
}

const verb = apply ? '' : ' (would be)';
console.log(`\nCache headers set${verb}: ${totals.cacheSet}`);
console.log(`Thumbnails created${verb}: ${totals.thumbsCreated}`);
console.log(`Already up to date: ${totals.alreadyDone}`);
if (totals.missing) console.log(`Missing from bucket: ${totals.missing}`);
if (totals.failed) console.log(`Failed: ${totals.failed} (safe to re-run)`);
