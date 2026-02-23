const fs = require('fs');
const path = require('path');

function getProjectRoot() {
  return path.resolve(__dirname, '..', '..');
}

function getTemplatesDir() {
  return path.join(getProjectRoot(), 'templates');
}

function getFillMapsDir() {
  return path.join(getProjectRoot(), 'fill-maps');
}

function getTestOutputDir() {
  return path.join(getProjectRoot(), 'tests', 'output');
}

function cleanupTestOutput() {
  const testOutputDir = getTestOutputDir();
  if (fs.existsSync(testOutputDir)) {
    const files = fs.readdirSync(testOutputDir);
    files.forEach(file => {
      const filePath = path.join(testOutputDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        // Ignore
      }
    });
  }
}

function isValidPDF(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const buffer = fs.readFileSync(filePath);
  return buffer.slice(0, 4).toString() === '%PDF';
}

function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

module.exports = {
  getProjectRoot,
  getTemplatesDir,
  getFillMapsDir,
  getTestOutputDir,
  cleanupTestOutput,
  isValidPDF,
  getFileSize
};
