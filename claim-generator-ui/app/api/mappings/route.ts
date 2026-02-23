import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function getMappingsDir(): string {
  return path.join(process.cwd(), "templates", "mappings");
}

export async function GET() {
  try {
    const dir = getMappingsDir();
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ mappings: [] });
    }
    const files = fs.readdirSync(dir);
    const mappings = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.slice(0, -5));
    return NextResponse.json({ mappings });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
