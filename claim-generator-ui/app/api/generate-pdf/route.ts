import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUploadPath } from "@/lib/uploadStore";

function loadFillForm(): Promise<{ fillForm: (a: string, b: string, c: string, d: Record<string, number | number[]>) => Promise<string> }> {
  try {
    return Promise.resolve(require("claim-generator-service/src/fillForm.js"));
  } catch {
    const fromRepo = path.resolve(process.cwd(), "..", "claim-generator-service", "src", "fillForm.js");
    if (fs.existsSync(fromRepo)) return Promise.resolve(require(fromRepo));
    throw new Error("claim-generator-service not found");
  }
}

function getTmpDirs() {
  const cwd = process.cwd();
  const inputsDir = path.join(cwd, ".tmp", "inputs");
  const outputsDir = path.join(cwd, ".tmp", "outputs");
  [inputsDir, outputsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  return { inputsDir, outputsDir };
}

function generateRequestId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getMappingsDir(): string {
  return path.join(process.cwd(), "templates", "mappings");
}

function loadMappingByName(mappingName: string): Record<string, number | number[]> {
  const dir = getMappingsDir();
  const filePath = path.join(dir, `${mappingName}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Mapping not found: ${mappingName}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid mapping file format");
  }
  return data as Record<string, number | number[]>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, fieldMapping, mappingName, employeeData } = body;
    if (!uploadId || typeof employeeData !== "object") {
      return NextResponse.json(
        { error: "Missing uploadId or employeeData" },
        { status: 400 }
      );
    }
    let resolvedMapping: Record<string, number | number[]>;
    if (fieldMapping && typeof fieldMapping === "object" && !Array.isArray(fieldMapping)) {
      resolvedMapping = fieldMapping as Record<string, number | number[]>;
    } else if (mappingName && typeof mappingName === "string" && mappingName.trim()) {
      resolvedMapping = loadMappingByName(mappingName.trim());
    } else {
      return NextResponse.json(
        { error: "Provide either fieldMapping or mappingName" },
        { status: 400 }
      );
    }
    const templatePath = getUploadPath(uploadId);
    if (!templatePath || !fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "Template not found. Upload a PDF in Claim Field Mapping first." },
        { status: 400 }
      );
    }
    const { inputsDir, outputsDir } = getTmpDirs();
    const reqId = generateRequestId();
    const inputPath = path.join(inputsDir, `${reqId}.json`);
    const outputPath = path.join(outputsDir, `${reqId}.pdf`);
    fs.writeFileSync(inputPath, JSON.stringify(employeeData, null, 2));

    const { fillForm } = await loadFillForm();
    await fillForm(
      path.resolve(templatePath),
      path.resolve(inputPath),
      path.resolve(outputPath),
      resolvedMapping
    );

    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: "fillForm did not produce output file" },
        { status: 500 }
      );
    }
    const pdfBuffer = fs.readFileSync(outputPath);
    try {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch {
      // ignore cleanup errors
    }
    const safeName =
      mappingName && typeof mappingName === "string"
        ? (mappingName.trim().replace(/[^a-zA-Z0-9_-]/g, "") || null)
        : null;
    const filename = safeName ? `filled-claim-${safeName}.pdf` : "filled-claim.pdf";
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
