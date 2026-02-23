const { test } = require('node:test');
const assert = require('node:assert');
const { splitSSN, splitPhone, splitDate } = require('../../src/fillForm.js');

test('splitSSN - standard format with dashes', () => {
  const result = splitSSN('123-45-6789');
  assert.deepStrictEqual(result, ['123', '45', '6789']);
});

test('splitSSN - format without dashes', () => {
  const result = splitSSN('123456789');
  assert.deepStrictEqual(result, ['123', '45', '6789']);
});

test('splitSSN - already split format', () => {
  const result = splitSSN('123-45-6789');
  assert.deepStrictEqual(result, ['123', '45', '6789']);
});

test('splitSSN - short input', () => {
  const result = splitSSN('12345678');
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0], '123');
});

test('splitPhone - 3-field format with dashes', () => {
  const result = splitPhone('123-456-7890', 3);
  assert.deepStrictEqual(result, ['123', '456', '7890']);
});

test('splitPhone - 3-field format without dashes', () => {
  const result = splitPhone('1234567890', 3);
  assert.deepStrictEqual(result, ['123', '456', '7890']);
});

test('splitPhone - 3-field format with parentheses', () => {
  const result = splitPhone('(123) 456-7890', 3);
  assert.deepStrictEqual(result, ['123', '456', '7890']);
});

test('splitPhone - 2-field format', () => {
  const result = splitPhone('123-456-7890', 2);
  assert.deepStrictEqual(result, ['123', '4567890']);
});

test('splitPhone - 2-field format without dashes', () => {
  const result = splitPhone('1234567890', 2);
  assert.deepStrictEqual(result, ['123', '4567890']);
});

test('splitDate - MM/DD/YYYY format', () => {
  const result = splitDate('01/15/2025');
  assert.deepStrictEqual(result, ['01', '15', '2025']);
});

test('splitDate - MM-DD-YYYY format', () => {
  const result = splitDate('01-15-2025');
  assert.deepStrictEqual(result, ['01', '15', '2025']);
});

test('splitDate - compact format', () => {
  const result = splitDate('01152025');
  assert.strictEqual(result.length, 3);
  assert(result[0].length > 0 || result[1].length > 0 || result[2].length > 0);
});

test('splitDate - invalid format returns empty strings', () => {
  const result = splitDate('invalid');
  assert.strictEqual(result.length, 3);
});
