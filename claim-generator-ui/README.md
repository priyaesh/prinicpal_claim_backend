# Claim Generator UI

Next.js + React UI for **Claim Field Mapping** and **Claim Generator**.

## Prerequisites

- **Node.js 18.17+** (required by Next.js). Node **20 LTS** is recommended.
  - If you use [nvm](https://github.com/nvm-sh/nvm): run `nvm use` in this directory (see `.nvmrc`) or `nvm install 20 && nvm use 20`.
  - **If you see "nvm is not compatible with the npm config prefix option"**: run `npm config delete prefix` once, then `nvm use 20` again.
  - Check your version: `node -v`
- From repo root: `npm install` (installs workspaces including this app and the two Node services)
- For encrypted PDFs: `qpdf` on PATH (e.g. `brew install qpdf`)

## Run

From repo root (no workspace flag needed):

```bash
npm run dev:ui
```

Or from this directory (after `npm install` at root):

```bash
cd claim-generator-ui
npm run dev
```

If you get **"This command does not support workspaces"**, use one of the commands above instead of `npm run dev -w claim-generator-ui`.

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Claim Field Mapping** (`/mapping`): Upload a PDF template → parse fields (calls `listFields` from claim-field-mapping-service) → see table of fields → map each unified-data key (employeeName, ssn, phone, etc.) to one or more field indices. Mapping and upload ID are saved in localStorage so the Generator can use them.
2. **Claim Generator** (`/generator`): Select one of 5 mock employees → click **Generate PDF** (calls `fillForm` from claim-generator-service with the saved template and mapping). The filled PDF downloads.

## API

- `POST /api/list-fields`: body = multipart form with `file` (PDF). Returns `{ uploadId, formName, fields }`.
- `POST /api/generate-pdf`: body = JSON `{ uploadId, fieldMapping, employeeData }`. Returns PDF file.
