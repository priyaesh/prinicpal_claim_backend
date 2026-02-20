# ClaimBuilder

Fill PDF claim forms from templates using semantic field mappings and JSON input.

## Requirements

- Node.js
- **Encrypted templates:** [qpdf](https://qpdf.sourceforge.io/) must be installed and on your PATH.
  - **macOS:** `brew install qpdf`
  - **Linux:** `apt install qpdf` or `yum install qpdf`
  - **Windows:** 
    1. Download qpdf from [https://qpdf.sourceforge.io/](https://qpdf.sourceforge.io/)
    2. Extract the zip file
    3. Add the `bin` folder to your system PATH, or place `qpdf.exe` in a folder already on your PATH
    4. Alternatively, use [Scoop](https://scoop.sh/): `scoop install qpdf`
    5. Or use [Chocolatey](https://chocolatey.org/): `choco install qpdf`
  
  **Alternative:** If you cannot install qpdf, use a decrypted PDF template instead.

## Usage

```bash
npm run fill                    # use default template and templates/unified-data.json
node src/fillForm.js [template] [input.json]   # custom paths
npm run list-fields             # list form field indices and types
```

Put your template PDF in `templates/` and your field values in `templates/unified-data.json` (keys = semantic field names; see `fill-maps/` for mappings). Filled PDFs are written to `output/`.
