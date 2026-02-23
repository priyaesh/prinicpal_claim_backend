const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('../helpers/testHelpers');

test('field-map-principal.json exists and has correct structure', () => {
  const fieldMapPath = path.join(getTemplatesDir(), 'field-map-principal.json');
  assert(fs.existsSync(fieldMapPath), 'field-map-principal.json should exist');

  const fieldMap = JSON.parse(fs.readFileSync(fieldMapPath, 'utf8'));
  assert(Array.isArray(fieldMap), 'field-map-principal.json should be an array');

  if (fieldMap.length > 0) {
    const firstField = fieldMap[0];
    assert('index' in firstField, 'Field map entries should have index');
    assert('type' in firstField, 'Field map entries should have type');
    assert('name' in firstField, 'Field map entries should have name');
    assert('page' in firstField, 'Field map entries should have page');
  }
});

test('field-map-shelterpoint.json exists and has correct structure', () => {
  const fieldMapPath = path.join(getTemplatesDir(), 'field-map-shelterpoint.json');
  assert(fs.existsSync(fieldMapPath), 'field-map-shelterpoint.json should exist');

  const fieldMap = JSON.parse(fs.readFileSync(fieldMapPath, 'utf8'));
  assert(Array.isArray(fieldMap), 'field-map-shelterpoint.json should be an array');

  if (fieldMap.length > 0) {
    const firstField = fieldMap[0];
    assert('index' in firstField, 'Field map entries should have index');
    assert('type' in firstField, 'Field map entries should have type');
    assert('name' in firstField, 'Field map entries should have name');
    assert('page' in firstField, 'Field map entries should have page');
  }
});
