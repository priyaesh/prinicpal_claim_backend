const fs = require('fs');
const path = require('path');

/**
 * Get the project root directory (claim-field-mapping-service root)
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
 * Check if a file is a valid PDF by checking header
 */
function isValidPDF(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const buffer = fs.readFileSync(filePath);
  return buffer.slice(0, 4).toString() === '%PDF';
}

module.exports = {
  getProjectRoot,
  getTemplatesDir,
  isValidPDF
};
