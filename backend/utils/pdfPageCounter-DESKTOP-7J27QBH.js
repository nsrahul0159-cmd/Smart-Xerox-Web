import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const countPdfPages = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await PDFParse(dataBuffer);
    return data.numpages;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return 1; // Default fallback just in case
  }
};
