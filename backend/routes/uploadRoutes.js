import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { countPdfPages } from '../utils/pdfPageCounter.js';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temporary uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Make filename unique
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    fieldSize: 10 * 1024 * 1024 // 10MB for fields
  }
});

router.post('/', upload.array('files', 10), async (req, res, next) => {
  try {
    const filesInfo = [];
    let totalPages = 0;

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established.');
    }
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    for (const file of req.files) {
      // 1. Count PDF Pages
      const pages = await countPdfPages(file.path);
      totalPages += pages;

      // 2. Stream to GridFS
      const uploadStream = bucket.openUploadStream(file.filename, {
        contentType: file.mimetype
      });
      
      const readStream = fs.createReadStream(file.path);
      readStream.pipe(uploadStream);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
        readStream.on('error', reject);
      });

      // 3. Delete Local Temporary File
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Failed to clear tmp file:', file.path, err);
      }

      // Add virtual streaming path
      filesInfo.push({
        originalName: file.originalname,
        filename: file.filename,
        path: `/uploads/${file.filename}`, 
        size: file.size,
        pages: pages
      });
    }

    res.status(200).json({ files: filesInfo, totalPages });
  } catch (error) {
    console.error('Upload Error:', error);
    next(error); // Pass to global error handler
  }
});

export default router;
