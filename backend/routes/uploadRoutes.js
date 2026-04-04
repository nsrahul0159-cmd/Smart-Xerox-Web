import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { countPdfPages } from '../utils/pdfPageCounter.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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
