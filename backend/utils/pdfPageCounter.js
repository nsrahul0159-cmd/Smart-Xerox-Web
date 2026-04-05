import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const countPdfPages = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.numpages;
  } catch (error) {
    console.error('Error parsing PDF at path:', filePath, error);
    throw new Error('Could not read PDF pages. Please ensure the file is a valid PDF.');
  }
};
