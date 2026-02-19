const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { PDFDocument } = require('pdf-lib');

const defaultTemplatePath = path.join(
  __dirname,
  '..',
  'sample',
  'principal_bond_with_child_claim_form.pdf'
);
const defaultInputPath = path.join(__dirname, '..', 'sample', 'data.json');
const defaultOutputDir = path.join(__dirname, '..', 'output');

function ensureOutputDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const QPDF_ERR_MSG =
  'Template appears encrypted. Install qpdf and ensure it is on PATH (e.g. brew install qpdf), or use a decrypted template.';

function decryptTemplateToTemp(templateResolved) {
  const tempPath = path.join(os.tmpdir(), `pdf-fill-decrypt-${Date.now()}.pdf`);
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
    throw new Error(`${QPDF_ERR_MSG} ${hint}`);
  }
  return tempPath;
}

async function fillForm(templatePath, inputPath, outputPath) {
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

  for (const [key, value] of Object.entries(data)) {
    const index = parseInt(key, 10);
    if (Number.isNaN(index) || index < 0 || index >= fields.length) continue;

    const field = fields[index];
    const type = field.constructor.name;

    if (type === 'PDFTextField') {
      field.setText(String(value ?? ''));
    } else if (type === 'PDFCheckBox') {
      if (value === true || value === 'true' || value === '1' || value === 'yes') {
        field.check();
      } else {
        field.uncheck();
      }
    }
  }

  form.updateFieldAppearances();
  form.flatten({ updateFieldAppearances: true });

  const pdfOut = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfOut);
  return outputPath;
}

async function main() {
  const templatePath = process.argv[2] || defaultTemplatePath;
  const inputPath = process.argv[3] || defaultInputPath;
  const outputDir = path.resolve(defaultOutputDir);
  ensureOutputDir(outputDir);

  const outputFileName = `filled_principal_bond_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  await fillForm(templatePath, inputPath, outputPath);
  console.log('Filled PDF written to:', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
