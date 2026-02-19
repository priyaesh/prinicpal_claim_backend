# PDF Reader / Form Filler

Fill PDF forms from a template using JSON input.

## Requirements

- Node.js
- **Encrypted templates:** [qpdf](https://qpdf.sourceforge.io/) must be installed and on your PATH (e.g. `brew install qpdf` on macOS, `apt install qpdf` on Linux). Use a decrypted template if you cannot install qpdf.

## Usage

```bash
npm run fill                    # use default template and sample/data.json
node src/fillForm.js [template] [input.json]   # custom paths
npm run list-fields             # list form field indices and types
```

Put your template PDF in `sample/` and your field values in `sample/data.json` (keys = field indices; see `sample/field-map.json`). Filled PDFs are written to `output/`.
