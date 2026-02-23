const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { listFields } = require('../../src/listFields.js');
const { getTemplatesDir } = require('../helpers/testHelpers');

test('listFields generates field-map-principal.json for principal template', async () => {
  const templatePath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');

  if (!fs.existsSync(templatePath)) {
    return;
  }

  const originalLog = console.log;
  console.log = () => {};

  try {
    await listFields(templatePath);

    const fieldMapPath = path.join(getTemplatesDir(), 'field-map-principal.json');
    assert(fs.existsSync(fieldMapPath), 'field-map-principal.json should be generated');

    const fieldMap = JSON.parse(fs.readFileSync(fieldMapPath, 'utf8'));
    assert(Array.isArray(fieldMap), 'Generated field map should be an array');
    assert(fieldMap.length > 0, 'Field map should contain fields');

    fieldMap.forEach(field => {
      assert(typeof field.index === 'number', 'Field should have numeric index');
      assert(typeof field.type === 'string', 'Field should have type string');
      assert(typeof field.name === 'string', 'Field should have name string');
      assert(field.page === null || typeof field.page === 'number', 'Field should have page number or null');
    });
  } finally {
    console.log = originalLog;
  }
});

test('listFields generates field-map-shelterpoint.json for shelterpoint template', async () => {
  const templatePath = path.join(getTemplatesDir(), 'claim_form_shelterpoint_bonding.pdf');

  if (!fs.existsSync(templatePath)) {
    return;
  }

  const originalLog = console.log;
  console.log = () => {};

  try {
    await listFields(templatePath);

    const fieldMapPath = path.join(getTemplatesDir(), 'field-map-shelterpoint.json');
    assert(fs.existsSync(fieldMapPath), 'field-map-shelterpoint.json should be generated');

    const fieldMap = JSON.parse(fs.readFileSync(fieldMapPath, 'utf8'));
    assert(Array.isArray(fieldMap), 'Generated field map should be an array');
    assert(fieldMap.length > 0, 'Field map should contain fields');

    fieldMap.forEach(field => {
      assert(typeof field.index === 'number', 'Field should have numeric index');
      assert(typeof field.type === 'string', 'Field should have type string');
      assert(typeof field.name === 'string', 'Field should have name string');
      assert(field.page === null || typeof field.page === 'number', 'Field should have page number or null');
    });
  } finally {
    console.log = originalLog;
  }
});

test('listFields detects form name correctly from filename', async () => {
  const principalPath = path.join(getTemplatesDir(), 'principal_bond_with_child_claim_form.pdf');
  const shelterpointPath = path.join(getTemplatesDir(), 'claim_form_shelterpoint_bonding.pdf');

  const originalLog = console.log;
  console.log = () => {};

  try {
    if (fs.existsSync(principalPath)) {
      await listFields(principalPath);
      const fieldMapPath = path.join(getTemplatesDir(), 'field-map-principal.json');
      assert(fs.existsSync(fieldMapPath), 'Should generate field-map-principal.json');
    }

    if (fs.existsSync(shelterpointPath)) {
      await listFields(shelterpointPath);
      const fieldMapPath = path.join(getTemplatesDir(), 'field-map-shelterpoint.json');
      assert(fs.existsSync(fieldMapPath), 'Should generate field-map-shelterpoint.json');
    }
  } finally {
    console.log = originalLog;
  }
});

test('listFields handles missing template file gracefully', async () => {
  const nonExistentPath = path.join(getTemplatesDir(), 'non-existent-template.pdf');

  const originalLog = console.log;
  console.log = () => {};

  try {
    await assert.rejects(
      async () => {
        await listFields(nonExistentPath);
      },
      /Template not found/,
      'Should throw error for missing template'
    );
  } finally {
    console.log = originalLog;
  }
});
