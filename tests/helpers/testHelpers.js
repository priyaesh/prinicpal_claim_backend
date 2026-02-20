const fs = require('fs');
const path = require('path');

/**
 * Get the project root directory
 */
function getProjectRoot() {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Get path to templates directory
 */
function getTemplatesDir() {
  return path.join(getProjectRoot(), 'templates');
}

/**
 * Get path to fill-maps directory
 */
function getFillMapsDir() {
  return path.join(getProjectRoot(), 'fill-maps');
}

/**
 * Get path to test output directory
 */
function getTestOutputDir() {
  return path.join(getProjectRoot(), 'tests', 'output');
}

/**
 * Clean up test output directory
 */
function cleanupTestOutput() {
  const testOutputDir = getTestOutputDir();
  if (fs.existsSync(testOutputDir)) {
    const files = fs.readdirSync(testOutputDir);
    files.forEach(file => {
      const filePath = path.join(testOutputDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        // Ignore errors
      }
    });
  }
}

/**
 * Check if a file is a valid PDF by checking header
 */
function isValidPDF(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const buffer = fs.readFileSync(filePath);
  // PDF files start with %PDF
  return buffer.slice(0, 4).toString() === '%PDF';
}

/**
 * Get file size in bytes
 */
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
