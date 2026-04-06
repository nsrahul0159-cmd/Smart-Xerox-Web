import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { GridFSBucket } from 'mongodb';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temporary uploads directory exists for disk->gridfs stream buffer
const tempUploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows files to be fetched by frontend
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, 
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

app.use(mongoSanitize()); // Prevent NoSQL Injection from req.body, req.query

// CORS Config
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'https://smart-xerox-web.onrender.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

export let gfsBucket;

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-xerox')
  .then(() => {
    console.log('Connected to MongoDB');
    gfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// GridFS Stream endpoint replacing old static setup
app.get('/api/uploads/:filename', async (req, res) => {
  if (!gfsBucket) return res.status(500).json({ error: 'GridFS not initialized yet.' });
  try {
    const filename = req.params.filename;
    const files = await gfsBucket.find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.set('Content-Disposition', `inline; filename="${filename}"`);
    res.set('Content-Type', 'application/pdf'); 
    res.set('Access-Control-Allow-Origin', '*'); // Allow specific resources
    
    const downloadStream = gfsBucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error fetching file', err);
    res.status(500).json({ error: err.message });
  }
});

import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Smart Xerox API is running securely!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});
