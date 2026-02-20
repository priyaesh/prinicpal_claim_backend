const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { fillForm, loadFormConfig } = require('../../src/fillForm.js');
const { getTemplatesDir, getFillMapsDir, getTestOutputDir, isValidPDF, getFileSize, cleanupTestOutput } = require('../helpers/testHelpers');

test('fillForm creates valid PDF for principal form', async () => {
  const templatePath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'test_principal_output.pdf');
  
  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return; // Skip if files don't exist
  }
  
  const config = loadFormConfig('principal');
  
  await fillForm(templatePath, inputPath, outputPath, config.fieldMapping);
  
  assert(fs.existsSync(outputPath), 'Output PDF should be created');
  assert(isValidPDF(outputPath), 'Output should be a valid PDF');
  assert(getFileSize(outputPath) > 0, 'Output PDF should have content');
});

test('fillForm creates valid PDF for shelterpoint form', async () => {
  const templatePath = path.join(getTemplatesDir(), 'claim_form_shelterpoint_bonding.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'test_shelterpoint_output.pdf');
  
  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return; // Skip if files don't exist
  }
  
  const config = loadFormConfig('shelterpoint');
  
  await fillForm(templatePath, inputPath, outputPath, config.fieldMapping);
  
  assert(fs.existsSync(outputPath), 'Output PDF should be created');
  assert(isValidPDF(outputPath), 'Output should be a valid PDF');
  assert(getFileSize(outputPath) > 0, 'Output PDF should have content');
});

test('fillForm handles multi-field mappings (SSN, phone, dateOfBirth)', async () => {
  const templatePath = path.join(getTemplatesDir(), 'claim_form_shelterpoint_bonding.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'test_multi_field_output.pdf');
  
  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return; // Skip if files don't exist
  }
  
  const config = loadFormConfig('shelterpoint');
  
  // Verify that SSN, phone, and dateOfBirth are array mappings
  assert(Array.isArray(config.fieldMapping.ssn), 'SSN should be array mapping');
  assert(Array.isArray(config.fieldMapping.phone), 'Phone should be array mapping');
  assert(Array.isArray(config.fieldMapping.dateOfBirth), 'DateOfBirth should be array mapping');
  
  await fillForm(templatePath, inputPath, outputPath, config.fieldMapping);
  
  assert(fs.existsSync(outputPath), 'Output PDF should be created');
  assert(isValidPDF(outputPath), 'Output should be a valid PDF');
});

test('fillForm handles fields not in mapping gracefully', async () => {
  const templatePath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'test_unknown_fields_output.pdf');
  
  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return; // Skip if files don't exist
  }
  
  const config = loadFormConfig('principal');
  
  // Add a field that doesn't exist in mapping
  const testData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  testData.unknownField = 'test value';
  
  const testInputPath = path.join(outputDir, 'test_data_with_unknown.json');
  fs.writeFileSync(testInputPath, JSON.stringify(testData));
  
  // Should not throw error for unknown field
  await assert.doesNotReject(
    async () => {
      await fillForm(templatePath, testInputPath, outputPath, config.fieldMapping);
    },
    'Should handle unknown fields without error'
  );
  
  assert(fs.existsSync(outputPath), 'Output PDF should still be created');
  
  // Cleanup
  if (fs.existsSync(testInputPath)) {
    fs.unlinkSync(testInputPath);
  }
});

test('loadFormConfig loads principal form configuration correctly', () => {
  const config = loadFormConfig('principal');
  
  assert(config.formName === 'principal', 'Form name should be principal');
  assert(fs.existsSync(config.templatePath), 'Template path should exist');
  assert(typeof config.fieldMapping === 'object', 'Field mapping should be an object');
  assert('employeeName' in config.fieldMapping, 'Field mapping should contain employeeName');
});

test('loadFormConfig loads shelterpoint form configuration correctly', () => {
  const config = loadFormConfig('shelterpoint');
  
  assert(config.formName === 'shelterpoint', 'Form name should be shelterpoint');
  assert(fs.existsSync(config.templatePath), 'Template path should exist');
  assert(typeof config.fieldMapping === 'object', 'Field mapping should be an object');
  assert('employeeName' in config.fieldMapping, 'Field mapping should contain employeeName');
});

test('loadFormConfig throws error for unknown form', () => {
  assert.throws(
    () => loadFormConfig('unknown'),
    /Unknown form/,
    'Should throw error for unknown form name'
  );
});

test('fillForm throws error for missing template', async () => {
  const nonExistentTemplate = path.join(getTemplatesDir(), 'non-existent.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputPath = path.join(getTestOutputDir(), 'test_error_output.pdf');
  const config = loadFormConfig('principal');
  
  await assert.rejects(
    async () => {
      await fillForm(nonExistentTemplate, inputPath, outputPath, config.fieldMapping);
    },
    /Template not found/,
    'Should throw error for missing template'
  );
});

test('fillForm throws error for missing input file', async () => {
  const templatePath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');
  const nonExistentInput = path.join(getTemplatesDir(), 'non-existent.json');
  const outputPath = path.join(getTestOutputDir(), 'test_error_output.pdf');
  const config = loadFormConfig('principal');
  
  if (!fs.existsSync(templatePath)) {
    return; // Skip if template doesn't exist
  }
  
  await assert.rejects(
    async () => {
      await fillForm(templatePath, nonExistentInput, outputPath, config.fieldMapping);
    },
    /Input file not found/,
    'Should throw error for missing input file'
  );
});
