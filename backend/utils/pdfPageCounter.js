import fs from 'fs';
import pdfParse from 'pdf-parse/lib/index.js';

export const countPdfPages = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.numpages;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return 1; // Default fallback just in case
  }
};
