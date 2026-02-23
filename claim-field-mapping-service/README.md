# Claim Field Mapping Service

Lists PDF form fields and outputs a **field-map** catalog (JSON array of `{ index, type, name, page }` per field). This catalog is used to build or maintain the semantic→index mapping (template field map / fill-map) consumed by the **Claim Generator Service**.

## Contents

- **Source**: `src/listFields.js` — reads a PDF template, lists form fields, writes `field-map-{formName}.json` next to the template.
- **Templates**: Place PDF templates in `templates/`; field-map JSONs are written there (e.g. `field-map-principal.json`, `field-map-shelterpoint.json`).

## Usage

```bash
npm run list-fields [templatePath]
```

Default template: `templates/principal_bond_with_child_claim_form.pdf`. For encrypted PDFs, `qpdf` must be installed (e.g. `brew install qpdf`).

## Tests

```bash
npm test
npm run test:integration
npm run test:validation
```

## Output

The service produces **field-map** JSON (catalog format), not the semantic→index mapping. The Claim Generator Service accepts the **template field map** (fill-map) that maps semantic keys to field indices; that mapping can be derived from this catalog (e.g. manually or via a separate tool).
