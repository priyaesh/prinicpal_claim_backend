# Claim Generator Service

Fills PDF claim forms from **unified-data** JSON using a **template field map** (semantic→field index mapping). This service accepts the template field map JSON that was generated or maintained for each form (e.g. from the Claim Field Mapping service’s field catalog or from a separate mapping step).

## Contents

- **Source**: `src/fillForm.js` — loads template PDF, unified-data JSON, and template field map; writes filled PDF to output.
- **Template field maps**: `fill-maps/` (e.g. `fill-map-principal.json`, `fill-map-shelterpoint.json`) — semantic key → field index or array of indices.
- **Data**: `templates/unified-data.json` — default/sample claim payload. Template PDFs can be placed in `templates/` or provided by path at runtime.

## Usage

```bash
npm run fill [formName] [inputJsonPath]
```

Form name: `principal` or `shelterpoint`. Default input: `templates/unified-data.json`. Output: `output/{formName}/filled_*.pdf`. For encrypted templates, `qpdf` must be on PATH.

### Programmatic

- `loadFormConfig(formName)` — load config for `principal` or `shelterpoint` (template path + field mapping from `fill-maps/`).
- `buildFormConfig(templatePath, templateFieldMapPathOrObject)` — build config from a template PDF path and either a path to a template field map JSON file or the mapping object.
- `fillForm(templatePath, inputPath, outputPath, fieldMapping)` — fill the form.

The **template field map** is the semantic→index mapping (fill-map). The Claim Field Mapping service produces the field **catalog** (field-map); that catalog is used to build or maintain this template field map.

## Tests

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:validation
npm run test:e2e
```
