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

const QPDF_ERR_MSG =
  'Template appears encrypted. Install qpdf and ensure it is on PATH (e.g. brew install qpdf), or use a decrypted template.';

function decryptTemplateToTemp(templateResolved) {
  const tempPath = path.join(os.tmpdir(), `pdf-listfields-decrypt-${Date.now()}.pdf`);
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

function getPageNumberForField(form, pdfDoc, field) {
  try {
    const widgets = field.acroField.getWidgets();
    if (!widgets || widgets.length === 0) return null;
    const page = form.findWidgetPage(widgets[0]);
    const pages = pdfDoc.getPages();
    const idx = pages.indexOf(page);
    return idx >= 0 ? idx + 1 : null; // 1-based page number
  } catch {
    return null;
  }
}

async function listFields(templatePath = defaultTemplatePath) {
  const resolved = path.resolve(templatePath);
  if (!fs.existsSync(resolved)) {
    console.error('Template not found:', resolved);
    process.exit(1);
  }

  let pdfBytes = fs.readFileSync(resolved);
  let pdfDoc = null;
  let tempPath = null;

  try {
    pdfDoc = await PDFDocument.load(pdfBytes);
  } catch {
    tempPath = decryptTemplateToTemp(resolved);
    try {
      pdfBytes = fs.readFileSync(tempPath);
      pdfDoc = await PDFDocument.load(pdfBytes);
    } finally {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log('Form fields in', path.basename(resolved), '\n');
  const byType = {};
  const fieldList = [];
  const byPage = {};

  fields.forEach((field, index) => {
    const name = field.getName();
    const type = field.constructor.name;
    const pageNum = getPageNumberForField(form, pdfDoc, field);
    fieldList.push({ index, type, name, page: pageNum });
    if (!byType[type]) byType[type] = [];
    byType[type].push(name);
    if (pageNum != null) {
      if (!byPage[pageNum]) byPage[pageNum] = [];
      byPage[pageNum].push(index);
    }
    const pageStr = pageNum != null ? ` (page ${pageNum})` : ' (page ?)';
    console.log(`[${index}] ${type}${pageStr}`);
  });

  console.log('\n--- By page (page N: field indices) ---');
  const sortedPages = Object.keys(byPage)
    .map(Number)
    .sort((a, b) => a - b);
  for (const pageNum of sortedPages) {
    const indices = byPage[pageNum].sort((a, b) => a - b);
    console.log(`Page ${pageNum}: ${indices.join(', ')}`);
  }

  console.log('\n--- Summary by type ---');
  Object.entries(byType).forEach(([type, names]) => {
    console.log(`${type}: ${names.length}`);
  });

  const fieldMapPath = path.join(path.dirname(resolved), 'field-map.json');
  fs.writeFileSync(
    fieldMapPath,
    JSON.stringify(
      fieldList.map(({ index, type, page }) => ({ index, type, page })),
      null,
      2
    )
  );
  console.log('\nWrote index map to', fieldMapPath);
}

const templatePath = process.argv[2] || defaultTemplatePath;
listFields(templatePath).catch((err) => {
  console.error(err);
  process.exit(1);
});
