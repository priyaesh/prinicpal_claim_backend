# Test Suite Documentation

## Overview

This test suite verifies all functionality of the PDF form filler, including utility functions, JSON validation, field listing, and PDF form filling for both principal and shelterpoint forms.

## Test Structure

```
tests/
├── unit/           # Unit tests for utility functions
├── validation/     # JSON validation tests
├── integration/    # Integration tests for listFields and fillForm
├── e2e/            # End-to-end tests
├── helpers/        # Test helper utilities
├── fixtures/       # Test data files
└── output/         # Test output directory (gitignored)
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:validation    # JSON validation tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only
```

## Test Coverage

### Unit Tests (`tests/unit/utils.test.js`)
- ✅ `splitSSN()` - Various SSN formats (with/without dashes)
- ✅ `splitPhone()` - 2-field and 3-field phone splitting
- ✅ `splitDate()` - Date splitting (MM/DD/YYYY, MM-DD-YYYY)

### Validation Tests (`tests/validation/json.test.js`)
- ✅ `unified-data.json` structure validation
- ✅ `fill-map-principal.json` and `fill-map-shelterpoint.json` validation
- ✅ Field index validation (numbers or arrays of numbers)
- ✅ Semantic field name mapping verification
- ✅ `field-map-{form}.json` structure validation

### Integration Tests

#### `tests/integration/listFields.test.js`
- ✅ Field map generation for principal form
- ✅ Field map generation for shelterpoint form
- ✅ Form name detection from filename
- ✅ Error handling for missing templates

#### `tests/integration/fillForm.test.js`
- ✅ PDF generation for principal form
- ✅ PDF generation for shelterpoint form
- ✅ Multi-field mappings (SSN, phone, dateOfBirth)
- ✅ Handling of fields not in mapping
- ✅ Form configuration loading
- ✅ Error handling (missing files, invalid data)

### End-to-End Tests (`tests/e2e/fullFlow.test.js`)
- ✅ Complete flow: list fields → load config → fill form (principal)
- ✅ Complete flow: list fields → load config → fill form (shelterpoint)
- ✅ Verify filled PDFs contain data
- ✅ Both forms can use same unified-data.json

## Test Results

All 38 tests passing ✅

## Notes

- Tests use Node.js built-in test runner (`node:test`) - no additional dependencies
- Test output PDFs are written to `tests/output/` (gitignored)
- Tests suppress console output during execution for cleaner output
- Tests gracefully skip if required template files don't exist
