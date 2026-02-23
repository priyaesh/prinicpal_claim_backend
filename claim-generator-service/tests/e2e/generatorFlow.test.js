const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { fillForm, loadFormConfig } = require('../../src/fillForm.js');
const { getTemplatesDir, getTestOutputDir, isValidPDF } = require('../helpers/testHelpers');

test('Generator-only flow: load config, fill form, verify PDF (principal)', async () => {
  const templatePath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'e2e_principal_output.pdf');

  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return;
  }

  const config = loadFormConfig('principal');
  await fillForm(config.templatePath, inputPath, outputPath, config.fieldMapping);

  assert(fs.existsSync(outputPath), 'Output PDF should be created');
  assert(isValidPDF(outputPath), 'Output should be a valid PDF');
  assert(fs.statSync(outputPath).size > 1000, 'Output PDF should have reasonable size');
});

test('Generator-only flow: load config, fill form, verify PDF (shelterpoint)', async () => {
  const templatePath = path.join(getTemplatesDir(), 'claim_form_shelterpoint_bonding.pdf');
  const inputPath = path.join(getTemplatesDir(), 'unified-data.json');
  const outputDir = getTestOutputDir();
  const outputPath = path.join(outputDir, 'e2e_shelterpoint_output.pdf');

  if (!fs.existsSync(templatePath) || !fs.existsSync(inputPath)) {
    return;
  }

  const config = loadFormConfig('shelterpoint');
  await fillForm(config.templatePath, inputPath, outputPath, config.fieldMapping);

  assert(fs.existsSync(outputPath), 'Output PDF should be created');
  assert(isValidPDF(outputPath), 'Output should be a valid PDF');
  assert(fs.statSync(outputPath).size > 1000, 'Output PDF should have reasonable size');
});
