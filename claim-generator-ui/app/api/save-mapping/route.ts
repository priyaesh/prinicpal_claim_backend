import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function getMappingsDir(): string {
  const cwd = process.cwd();
  const dir = path.join(cwd, "templates", "mappings");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").trim() || "mapping";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, fieldMap } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing or invalid name" }, { status: 400 });
    }
    const trimmed = name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Mapping name cannot be empty" }, { status: 400 });
    }
    const safeName = sanitizeName(trimmed);
    if (!fieldMap || typeof fieldMap !== "object" || Array.isArray(fieldMap)) {
      return NextResponse.json({ error: "Missing or invalid fieldMap" }, { status: 400 });
    }
    const dir = getMappingsDir();
    const filePath = path.join(dir, `${safeName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fieldMap, null, 2), "utf8");
    return NextResponse.json({ success: true, name: safeName });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
