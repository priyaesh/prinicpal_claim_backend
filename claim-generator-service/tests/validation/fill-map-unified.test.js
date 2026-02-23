const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { getTemplatesDir, getFillMapsDir } = require('../helpers/testHelpers');

test('unified-data.json exists and is valid JSON', () => {
  const dataPath = path.join(getTemplatesDir(), 'unified-data.json');
  assert(fs.existsSync(dataPath), 'unified-data.json should exist');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert(typeof data === 'object', 'unified-data.json should be an object');
  assert(!Array.isArray(data), 'unified-data.json should be an object, not an array');
});

test('unified-data.json contains expected semantic field names', () => {
  const dataPath = path.join(getTemplatesDir(), 'unified-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const expectedFields = [
    'employeeName',
    'employeeId',
    'phone',
    'address',
    'city',
    'dateOfBirth',
    'state',
    'zipCode',
    'ssn',
    'jobTitle'
  ];

  expectedFields.forEach(field => {
    assert(field in data, 'unified-data.json should contain ' + field);
  });
});

test('fill-map-principal.json exists and is valid JSON', () => {
  const mapPath = path.join(getFillMapsDir(), 'fill-map-principal.json');
  assert(fs.existsSync(mapPath), 'fill-map-principal.json should exist');

  const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  assert(typeof mapping === 'object', 'fill-map-principal.json should be an object');
});

test('fill-map-shelterpoint.json exists and is valid JSON', () => {
  const mapPath = path.join(getFillMapsDir(), 'fill-map-shelterpoint.json');
  assert(fs.existsSync(mapPath), 'fill-map-shelterpoint.json should exist');

  const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  assert(typeof mapping === 'object', 'fill-map-shelterpoint.json should be an object');
});

test('fill-map files contain valid field indices (numbers or arrays of numbers)', () => {
  const principalPath = path.join(getFillMapsDir(), 'fill-map-principal.json');
  const shelterpointPath = path.join(getFillMapsDir(), 'fill-map-shelterpoint.json');

  const principalMapping = JSON.parse(fs.readFileSync(principalPath, 'utf8'));
  const shelterpointMapping = JSON.parse(fs.readFileSync(shelterpointPath, 'utf8'));

  Object.values(principalMapping).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(index => {
        assert(typeof index === 'number', 'Field indices should be numbers');
        assert(index >= 0, 'Field indices should be non-negative');
      });
    } else {
      assert(typeof value === 'number', 'Field indices should be numbers');
      assert(value >= 0, 'Field indices should be non-negative');
    }
  });

  Object.values(shelterpointMapping).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(index => {
        assert(typeof index === 'number', 'Field indices should be numbers');
        assert(index >= 0, 'Field indices should be non-negative');
      });
    } else {
      assert(typeof value === 'number', 'Field indices should be numbers');
      assert(value >= 0, 'Field indices should be non-negative');
    }
  });
});

test('unified-data.json fields have mappings in both fill-map files', () => {
  const dataPath = path.join(getTemplatesDir(), 'unified-data.json');
  const principalPath = path.join(getFillMapsDir(), 'fill-map-principal.json');
  const shelterpointPath = path.join(getFillMapsDir(), 'fill-map-shelterpoint.json');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const principalMapping = JSON.parse(fs.readFileSync(principalPath, 'utf8'));
  const shelterpointMapping = JSON.parse(fs.readFileSync(shelterpointPath, 'utf8'));

  Object.keys(data).forEach(semanticName => {
    if (semanticName.startsWith('checkbox')) {
      return;
    }

    const inPrincipal = semanticName in principalMapping;
    const inShelterpoint = semanticName in shelterpointMapping;

    if (['employeeName', 'phone', 'address', 'city', 'dateOfBirth', 'ssn', 'jobTitle'].includes(semanticName)) {
      assert(inPrincipal || inShelterpoint,
        'Field ' + semanticName + ' should have a mapping in at least one fill-map file');
    }
  });
});
