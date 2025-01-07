
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');


const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};


const extractTextFromImage = async (filePath) => {
  const result = await Tesseract.recognize(filePath, 'eng').catch(() => ({ data: { text: '' } }));
  return result.data.text;
};

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
};
