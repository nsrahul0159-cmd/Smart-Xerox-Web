import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { countPdfPages } from '../utils/pdfPageCounter.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    fieldSize: 10 * 1024 * 1024 // 10MB for fields
  }
});

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const filesInfo = [];
    let totalPages = 0;

    for (const file of req.files) {
      const pages = await countPdfPages(file.path);
      totalPages += pages;

      filesInfo.push({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        pages: pages
      });
    }

    res.status(200).json({ files: filesInfo, totalPages });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload and process files.' });
  }
});

export default router;
