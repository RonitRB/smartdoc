const pdfParse = require('pdf-parse');
const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text || '';
    console.log(`[SmartDoc PDF] Extracted ${text.length} chars, ${data.numpages} pages`);
    return text;
  } catch (err) {
    console.error(`[SmartDoc PDF] Extraction error: ${err.message}`);
    throw new Error(`PDF extraction failed: ${err.message}`);
  }
};

module.exports = { extractTextFromPDF };
