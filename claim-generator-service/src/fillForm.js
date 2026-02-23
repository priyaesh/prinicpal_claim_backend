const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { PDFDocument } = require('pdf-lib');

const serviceRoot = path.join(__dirname, '..');
const defaultInputPath = path.join(serviceRoot, 'templates', 'unified-data.json');
const defaultOutputDir = path.join(serviceRoot, 'output');

// Default form configurations (template PDF path + template field map path)
const formConfigs = {
  shelterpoint: {
    template: path.join(serviceRoot, 'templates', 'claim_form_shelterpoint_bonding.pdf'),
    mapping: path.join(serviceRoot, 'fill-maps', 'fill-map-shelterpoint.json'),
    name: 'shelterpoint'
  },
  principal: {
    template: path.join(serviceRoot, 'templates', 'principal_bond_with_child_claim_form.pdf'),
    mapping: path.join(serviceRoot, 'fill-maps', 'fill-map-principal.json'),
    name: 'principal'
  }
};

function ensureOutputDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Clean up old PDF files in a directory, keeping only the most recent ones
 */
function cleanupOldFiles(dir, keepCount = 3) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => ({
      name: f,
      path: path.join(dir, f),
      mtime: fs.statSync(path.join(dir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  files.slice(keepCount).forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old file: ' + file.name);
  });
}

const QPDF_ERR_MSG =
  'Template appears encrypted. Install qpdf and ensure it is on PATH (e.g. brew install qpdf), or use a decrypted template.';

function decryptTemplateToTemp(templateResolved) {
  const tempPath = path.join(os.tmpdir(), 'pdf-fill-decrypt-' + Date.now() + '.pdf');
  const result = spawnSync('qpdf', ['--decrypt', templateResolved, tempPath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stderr = (result.stderr || '').trim();
  const outOk = result.status === 0 || (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 0);
  if (!outOk) {
    const hint = result.error?.code === 'ENOENT'
      ? 'qpdf is not installed or not on PATH.'
      : (stderr || result.error?.message || String(result.status));
    throw new Error(QPDF_ERR_MSG + ' ' + hint);
  }
  return tempPath;
}

function splitSSN(value) {
  const cleaned = String(value).replace(/-/g, '');
  if (cleaned.length === 9) {
    return [cleaned.substring(0, 3), cleaned.substring(3, 5), cleaned.substring(5, 9)];
  }
  const parts = String(value).split('-');
  if (parts.length === 3) {
    return parts;
  }
  return [cleaned.substring(0, 3), cleaned.substring(3, 5), cleaned.substring(5, 9)];
}

function splitPhone(value, fieldCount = 3) {
  const cleaned = String(value).replace(/[-\s()]/g, '');

  if (fieldCount === 3) {
    if (cleaned.length === 10) {
      return [cleaned.substring(0, 3), cleaned.substring(3, 6), cleaned.substring(6, 10)];
    }
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return [parts[0].replace(/\D/g, ''), parts[1].replace(/\D/g, ''), parts[2].replace(/\D/g, '')];
    }
    return [cleaned.substring(0, 3), cleaned.substring(3, 6), cleaned.substring(6, 10)];
  } else {
    if (cleaned.length === 10) {
      return [cleaned.substring(0, 3), cleaned.substring(3, 10)];
    }
    const parts = String(value).split('-');
    if (parts.length >= 2) {
      return [parts[0].replace(/\D/g, ''), parts.slice(1).join('').replace(/\D/g, '')];
    }
    return [cleaned.substring(0, 3), cleaned.substring(3)];
  }
}

function splitDate(value) {
  const parts = String(value).split(/[\/\-]/);
  if (parts.length === 3) {
    return [parts[0], parts[1], parts[2]];
  }
  const dateStr = String(value);
  if (dateStr.length >= 8) {
    return [dateStr.substring(0, 2), dateStr.substring(2, 4), dateStr.substring(4, 8)];
  }
  return ['', '', ''];
}

function fillField(field, value, fieldType) {
  if (fieldType === 'PDFTextField') {
    field.setText(String(value ?? ''));
  } else if (fieldType === 'PDFCheckBox') {
    if (value === true || value === 'true' || value === '1' || value === 'yes') {
      field.check();
    } else {
      field.uncheck();
    }
  }
}

async function fillForm(templatePath, inputPath, outputPath, fieldMapping) {
  const templateResolved = path.resolve(templatePath);
  const inputResolved = path.resolve(inputPath);

  if (!fs.existsSync(templateResolved)) {
    throw new Error('Template not found: ' + templateResolved);
  }
  if (!fs.existsSync(inputResolved)) {
    throw new Error('Input file not found: ' + inputResolved);
  }

  let pdfBytes = fs.readFileSync(templateResolved);
  let pdfDoc = null;
  let tempPath = null;

  try {
    pdfDoc = await PDFDocument.load(pdfBytes);
  } catch {
    tempPath = decryptTemplateToTemp(templateResolved);
    try {
      pdfBytes = fs.readFileSync(tempPath);
      pdfDoc = await PDFDocument.load(pdfBytes);
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        tempPath = null;
      }
    }
  }

  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const data = JSON.parse(fs.readFileSync(inputResolved, 'utf8'));

  for (const [semanticName, value] of Object.entries(data)) {
    const mapping = fieldMapping[semanticName];
    if (mapping === undefined) continue;

    if (Array.isArray(mapping)) {
      let parts = [];

      if (semanticName === 'ssn') {
        parts = splitSSN(value);
      } else if (semanticName === 'phone') {
        parts = splitPhone(value, mapping.length);
      } else if (semanticName === 'dateOfBirth') {
        parts = splitDate(value);
      } else {
        parts = String(value).split(/[-\s\/]/);
      }

      for (let i = 0; i < mapping.length && i < parts.length; i++) {
        const index = mapping[i];
        if (Number.isNaN(index) || index < 0 || index >= fields.length) continue;
        const field = fields[index];
        const type = field.constructor.name;
        fillField(field, parts[i], type);
      }
    } else {
      const index = mapping;
      if (Number.isNaN(index) || index < 0 || index >= fields.length) continue;
      const field = fields[index];
      const type = field.constructor.name;
      fillField(field, value, type);
    }
  }

  form.updateFieldAppearances();
  form.flatten({ updateFieldAppearances: true });

  const pdfOut = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfOut);
  return outputPath;
}

function promptFormSelection() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\nWhich claim form do you want to fill?');
    console.log('1. Shelterpoint');
    console.log('2. Principal');
    rl.question('Enter your choice (1 or 2): ', (answer) => {
      rl.close();
      const choice = answer.trim();
      if (choice === '1') {
        resolve('shelterpoint');
      } else if (choice === '2') {
        resolve('principal');
      } else {
        console.error('Invalid choice. Please enter 1 or 2.');
        process.exit(1);
      }
    });
  });
}

/**
 * Build form config from template path and template field map (path or object).
 * The template field map is the semantic→index mapping (fill-map).
 */
function buildFormConfig(templatePath, templateFieldMapPathOrObject) {
  const templatePathResolved = path.resolve(templatePath);
  let fieldMapping;

  if (typeof templateFieldMapPathOrObject === 'string') {
    const mappingPath = path.resolve(templateFieldMapPathOrObject);
    if (!fs.existsSync(mappingPath)) {
      throw new Error('Template field map not found: ' + mappingPath);
    }
    fieldMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  } else if (templateFieldMapPathOrObject && typeof templateFieldMapPathOrObject === 'object') {
    fieldMapping = templateFieldMapPathOrObject;
  } else {
    throw new Error('Template field map must be a file path (string) or mapping object');
  }

  return {
    templatePath: templatePathResolved,
    fieldMapping,
    formName: undefined
  };
}

function loadFormConfig(formName) {
  const config = formConfigs[formName];
  if (!config) {
    throw new Error('Unknown form: ' + formName);
  }

  const mappingPath = path.resolve(config.mapping);
  if (!fs.existsSync(mappingPath)) {
    throw new Error('Field mapping not found: ' + mappingPath);
  }

  const fieldMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const templatePath = path.resolve(config.template);

  return {
    templatePath,
    fieldMapping,
    formName: config.name
  };
}

async function main() {
  let formName = process.argv[2];

  if (!formName) {
    formName = await promptFormSelection();
  } else {
    formName = formName.toLowerCase();
    if (formName !== 'shelterpoint' && formName !== 'principal') {
      console.error('Invalid form name. Use "shelterpoint" or "principal".');
      process.exit(1);
    }
  }

  const config = loadFormConfig(formName);
  const inputPath = process.argv[3] || defaultInputPath;
  const outputDir = path.join(path.resolve(defaultOutputDir), config.formName);
  ensureOutputDir(outputDir);

  const timestamp = Date.now();
  const outputFileName = 'filled_' + config.formName + '_bonding_' + timestamp + '.pdf';
  const outputPath = path.join(outputDir, outputFileName);

  await fillForm(config.templatePath, inputPath, outputPath, config.fieldMapping);
  console.log('Filled PDF written to:', outputPath);

  cleanupOldFiles(outputDir, 3);
}

module.exports = {
  splitSSN,
  splitPhone,
  splitDate,
  fillField,
  fillForm,
  loadFormConfig,
  buildFormConfig,
  formConfigs
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
