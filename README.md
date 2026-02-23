# PDFReader / Claim Services

This repo is split into two modular Node services:

## 1. Claim Field Mapping Service (`claim-field-mapping-service/`)

- **Role:** Lists PDF form fields and outputs a **field-map** catalog (JSON array of `{ index, type, name, page }` per field).
- **Contains:** Templates (PDFs + field-map JSONs), `listFields.js`, and associated tests.
- **Output:** Field-map JSON files (e.g. `field-map-principal.json`, `field-map-shelterpoint.json`) written next to each template. This catalog is used to build or maintain the semantic→index mapping consumed by the Claim Generator.

See [claim-field-mapping-service/README.md](claim-field-mapping-service/README.md) for usage and tests.

## 2. Claim Generator Service (`claim-generator-service/`)

- **Role:** Accepts the **template field map** JSON (semantic→field index mapping) and uses it to fill a PDF from unified-data.
- **Contains:** `fillForm.js`, `templates/unified-data.json`, fill-maps (template field map JSONs), and associated tests.
- **Input:** Template PDF path, template field map (path or object), and claim data JSON (e.g. `unified-data.json`). **Output:** Filled PDF.

The template field map is the semantic→index mapping (fill-map). It can be produced or maintained using the field catalog from the Claim Field Mapping service.

See [claim-generator-service/README.md](claim-generator-service/README.md) for usage and tests.

## Requirements

- Node.js
- **Encrypted PDFs:** [qpdf](https://qpdf.sourceforge.io/) on PATH (e.g. `brew install qpdf` on macOS).

## Quick start

```bash
# Claim Field Mapping: list fields for a template
cd claim-field-mapping-service && npm install && npm run list-fields [templatePath]

# Claim Generator: fill a form (principal or shelterpoint)
cd claim-generator-service && npm install && npm run fill [formName] [inputJsonPath]
```

Place PDF templates in the respective service’s `templates/` directory as needed.
