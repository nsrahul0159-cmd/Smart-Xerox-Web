import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// NoSQL Injection protection natively handled via Joi validation schemas (e.g. orderRoutes.js)

// CORS Config
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : [
      'http://localhost:3000', 
      'https://smart-xerox-web.onrender.com',
      'https://smart-xerox-web-git-main-nsrahul0159-4537s-projects.vercel.app'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow if origin is in the allowed list, or if it's a Vercel preview branch
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
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

// Health check endpoint for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Server is healthy' 
  });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Smart Xerox API</title></head>
      <body style="font-family: Arial, sans-serif; padding: 2rem; text-align: center;">
        <h1 style="color: #4CAF50;">✅ Smart Xerox Backend is Running!</h1>
        <p>The server is deployed and correctly configured.</p>
        <p>API endpoints are available under <code>/api</code>.</p>
        <p><a href="/health">Check Server Health</a></p>
      </body>
    </html>
  `);
});

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested route does not exist' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});
