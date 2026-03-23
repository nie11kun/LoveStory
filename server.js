import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

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

app.post('/api/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls: fileUrls });
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

app.put('/api/memories/:id', (req, res) => {
  const data = readData();
  const index = data.memories.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  const updatedMemory = { ...data.memories[index], ...req.body, id: req.params.id };
  
  if (updatedMemory.date) {
    const inputDate = new Date(updatedMemory.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - inputDate.getTime());
    updatedMemory.daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  data.memories[index] = updatedMemory;
  writeData(data);
  res.json(updatedMemory);
});

app.delete('/api/memories/:id', (req, res) => {
  const data = readData();
  const index = data.memories.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  data.memories.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

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
