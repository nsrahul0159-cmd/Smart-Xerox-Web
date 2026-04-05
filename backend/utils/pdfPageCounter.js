import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

export const countPdfPages = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const pageCount = pdfDoc.getPageCount();
    console.log(`File ${filePath} has ${pageCount} pages`);
    return pageCount;
  } catch (error) {
    console.error('Error parsing PDF with pdf-lib:', error);
    throw new Error('Could not read PDF pages. Please ensure the file is a valid PDF.');
  }
};
