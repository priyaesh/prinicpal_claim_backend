import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUploadPath, setUploadPath } from "@/lib/uploadStore";

function loadListFields(): Promise<{ listFields: (templatePath: string) => Promise<void> }> {
  try {
    return Promise.resolve(require("claim-field-mapping-service/src/listFields.js"));
  } catch {
    const fromRepo = path.resolve(process.cwd(), "..", "claim-field-mapping-service", "src", "listFields.js");
    if (fs.existsSync(fromRepo)) return Promise.resolve(require(fromRepo));
    throw new Error("claim-field-mapping-service not found");
  }
}

function getTmpDir(): string {
  const cwd = process.cwd();
  const tmpDir = path.join(cwd, ".tmp", "uploads");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return tmpDir;
}

function generateUploadId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid file" },
        { status: 400 }
      );
    }
    const uploadId = generateUploadId();
    const tmpDir = getTmpDir();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "template.pdf";
    const uploadSubdir = path.join(tmpDir, uploadId);
    if (!fs.existsSync(uploadSubdir)) fs.mkdirSync(uploadSubdir, { recursive: true });
    const templatePath = path.join(uploadSubdir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(templatePath, buffer);
    const absolutePath = path.resolve(templatePath);
    setUploadPath(uploadId, absolutePath);

    const { listFields: listFieldsFn } = await loadListFields();
    await listFieldsFn(absolutePath);

    const templateBasename = path.basename(absolutePath, path.extname(absolutePath));
    let formName = "unknown";
    if (templateBasename.includes("shelterpoint") || templateBasename.includes("claim_form_shelterpoint")) {
      formName = "shelterpoint";
    } else if (templateBasename.includes("principal") || templateBasename.includes("principal_bond")) {
      formName = "principal";
    }
    const fieldMapPath = path.join(path.dirname(absolutePath), `field-map-${formName}.json`);
    if (!fs.existsSync(fieldMapPath)) {
      return NextResponse.json(
        { error: "listFields did not produce field-map file" },
        { status: 500 }
      );
    }
    const fields = JSON.parse(fs.readFileSync(fieldMapPath, "utf8"));

    return NextResponse.json({ uploadId, formName, fields });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
