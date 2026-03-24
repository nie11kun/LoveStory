import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DIST_DIR = path.join(__dirname, 'dist');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(DIST_DIR));

// Setup External Cloud Storage
let s3Client = null;
if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
  s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });
  console.log('✅ Cloudflare R2 / S3 Storage Enabled');
}

let s3PublicDomain = process.env.S3_PUBLIC_DOMAIN?.replace(/\/$/, "");
if (s3PublicDomain && !/^https?:\/\//i.test(s3PublicDomain)) {
  s3PublicDomain = `https://${s3PublicDomain}`;
}
const imgurClientId = process.env.IMGUR_CLIENT_ID;
if (imgurClientId) {
  console.log('⚠️ Imgur API Storage Enabled (Publicly Accessible)');
}

const getFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(err));
  });
};

// Helper to physically delete media from storage
const deleteMediaByUrl = async (url, globalData) => {
  if (globalData) {
    let refCount = 0;
    if (globalData.profile?.avatarUrl === url) refCount++;
    if (globalData.profile?.bgmUrl === url) refCount++;
    for (const memory of globalData.memories) {
      if (memory.images && memory.images.includes(url)) refCount++;
    }
    if (refCount > 0) {
      console.log(`♻️ GC Skipped: Media [${url.split('/').pop()}] is kept active by ${refCount} other reference(s).`);
      return;
    }
  }

  try {
    if (s3Client && s3PublicDomain && url.startsWith(s3PublicDomain)) {
      // It's an S3/R2 object
      const key = url.replace(`${s3PublicDomain}/`, '');
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }));
      console.log(`🗑️ Deleted from S3: ${key}`);
    } else if (url.startsWith('/uploads/')) {
      // It's a local file
      const fileName = url.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted locally: ${fileName}`);
      }
    }
  } catch (error) {
    console.error(`Failed to delete media ${url}:`, error);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Helper to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Seed the database with default tags if they don't exist or if the array is manually emptied
    if (!parsed.profile) parsed.profile = {};
    if (!parsed.profile.customTags || parsed.profile.customTags.length === 0) {
      parsed.profile.customTags = ["旅行", "日常", "纪念日", "美食", "约会", "礼物", "里程碑"];
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading data.json:', error);
    const initialData = { 
      profile: { customTags: ["旅行", "日常", "纪念日", "美食", "约会", "礼物", "里程碑"] }, 
      memories: [] 
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
};

// Helper to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing data.json:', error);
  }
};

// API Routes
app.get('/api/profile', (req, res) => {
  const data = readData();
  res.json(data.profile);
});

app.put('/api/profile', (req, res) => {
  const data = readData();
  data.profile = { ...data.profile, ...req.body };
  writeData(data);
  res.json(data.profile);
});

app.get('/api/memories', (req, res) => {
  const data = readData();
  res.json(data.memories);
});

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  try {
    const urls = [];

    for (const file of req.files) {
      if (s3Client && s3PublicDomain) {
        // Option A: Cloudflare R2 / AWS S3
        const fileHash = await getFileHash(file.path);
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `media/${fileHash}${ext}`;
        
        try {
          // Check if it already exists
          await s3Client.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: fileName }));
          console.log(`♻️ S3 Deduplication: [${fileName}] already exists, skipping upload.`);
        } catch (err) {
          // It doesn't exist, proceed to upload
          const fileStream = fs.createReadStream(file.path);
          const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/x-m4v', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };
          const contentType = mimeTypes[ext] || file.mimetype;
          await s3Client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: fileName, Body: fileStream, ContentType: contentType }));
        }
        
        fs.unlinkSync(file.path); // Safely remove local temp file
        urls.push(`${s3PublicDomain}/${fileName}`);
      } else if (imgurClientId) {
        // Option B: Imgur API
        const fileData = fs.readFileSync(file.path);
        const base64Image = fileData.toString('base64');
        const imgurForm = new URLSearchParams();
        imgurForm.append('image', base64Image);
        imgurForm.append('type', 'base64');

        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            'Authorization': `Client-ID ${imgurClientId}`
          },
          body: imgurForm
        });
        
        const data = await response.json();
        fs.unlinkSync(file.path);
        
        if (data.success) {
          urls.push(data.data.link);
        } else {
          throw new Error('Imgur upload failed: ' + JSON.stringify(data));
        }
      } else {
        // Default C: Local Disk Storage
        const fileHash = await getFileHash(file.path);
        const ext = path.extname(file.originalname).toLowerCase();
        const newFileName = `${fileHash}${ext}`;
        const newFilePath = path.join(UPLOADS_DIR, newFileName);
        
        if (fs.existsSync(newFilePath)) {
           console.log(`♻️ Local Deduplication: [${newFileName}] already exists, skipping.`);
           fs.unlinkSync(file.path);
        } else {
           fs.renameSync(file.path, newFilePath);
        }
        urls.push(`/uploads/${newFileName}`);
      }
    }

    res.json({ urls });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process upload.' });
  }
});

app.post('/api/memories', (req, res) => {
  const data = readData();
  
  const newMemory = {
    id: Date.now().toString(),
    ...req.body
  };
  
  // Calculate daysAgo roughly based on date input
  if (newMemory.date) {
    const inputDate = new Date(newMemory.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - inputDate.getTime());
    newMemory.daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } else {
    newMemory.daysAgo = 0;
  }
  
  data.memories.push(newMemory);
  writeData(data);
  
  res.status(201).json(newMemory);
});

app.put('/api/memories/:id', async (req, res) => {
  const data = readData();
  const index = data.memories.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  const oldMemory = data.memories[index];
  const updatedMemory = { ...oldMemory, ...req.body, id: req.params.id };
  
  // Garbage collect images that were removed during this edit
  const oldImages = oldMemory.images || [];
  const newImages = updatedMemory.images || [];
  const orphanedImages = oldImages.filter(img => !newImages.includes(img));
  
  if (updatedMemory.date) {
    const inputDate = new Date(updatedMemory.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - inputDate.getTime());
    updatedMemory.daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  data.memories[index] = updatedMemory;
  
  for (const mediaUrl of orphanedImages) {
    await deleteMediaByUrl(mediaUrl, data);
  }

  writeData(data);
  res.json(updatedMemory);
});

app.delete('/api/memories/:id', async (req, res) => {
  const data = readData();
  const index = data.memories.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  const memoryToDelete = data.memories[index];
  
  data.memories.splice(index, 1);
  
  // Garbage collect all associated images safely
  if (memoryToDelete.images && memoryToDelete.images.length > 0) {
    for (const mediaUrl of memoryToDelete.images) {
      await deleteMediaByUrl(mediaUrl, data);
    }
  }

  writeData(data);
  res.status(204).send();
});

// Async storage migration tool
const migrateLocalFilesToS3 = async () => {
  if (!s3Client || !s3PublicDomain) return;

  try {
    const data = readData();
    let updated = false;

    // Migrate memories
    for (const memory of data.memories) {
      if (!memory.images) continue;

      for (let i = 0; i < memory.images.length; i++) {
        const url = memory.images[i];
        if (url.startsWith('/uploads/')) {
          const fileName = url.replace('/uploads/', '');
          const filePath = path.join(UPLOADS_DIR, fileName);

          if (fs.existsSync(filePath)) {
            console.log(`🚀 Automated Migration: Pushing [${fileName}] to S3...`);
            const fileStream = fs.createReadStream(filePath);
            const s3Key = `media/${fileName}`;
            const ext = path.extname(fileName).toLowerCase();
            const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/x-m4v' };
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            await s3Client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key, Body: fileStream, ContentType: contentType }));
            
            memory.images[i] = `${s3PublicDomain}/${s3Key}`;
            updated = true;
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    // Migrate profile avatar
    if (data.profile?.avatarUrl?.startsWith('/uploads/')) {
      const url = data.profile.avatarUrl;
      const fileName = url.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        console.log(`🚀 Automated Migration: Pushing avatar [${fileName}] to S3...`);
        const fileStream = fs.createReadStream(filePath);
        const s3Key = `media/${fileName}`;
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
        
        await s3Client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key, Body: fileStream, ContentType: mimeTypes[ext] || 'application/octet-stream' }));
        data.profile.avatarUrl = `${s3PublicDomain}/${s3Key}`;
        updated = true;
        fs.unlinkSync(filePath);
      }
    }

    // Migrate BGM
    if (data.profile?.bgmUrl?.startsWith('/uploads/')) {
      const url = data.profile.bgmUrl;
      const fileName = url.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        console.log(`🚀 Automated Migration: Pushing BGM [${fileName}] to S3...`);
        const fileStream = fs.createReadStream(filePath);
        const s3Key = `media/${fileName}`;
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };
        
        await s3Client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key, Body: fileStream, ContentType: mimeTypes[ext] || 'application/octet-stream' }));
        data.profile.bgmUrl = `${s3PublicDomain}/${s3Key}`;
        updated = true;
        fs.unlinkSync(filePath);
      }
    }

    if (updated) {
      writeData(data);
      console.log('✅ Local to S3 Cloud Migration Completed.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Trigger migration gracefully in background
setTimeout(migrateLocalFilesToS3, 1000);

// Serve React SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Production build not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
