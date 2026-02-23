import path from "path";
import fs from "fs";

const uploads = new Map<string, string>();

function getRegistryPath(): string {
  const cwd = process.cwd();
  const tmpDir = path.join(cwd, ".tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  return path.join(tmpDir, "upload-registry.json");
}

function loadRegistry(): Record<string, string> {
  try {
    const raw = fs.readFileSync(getRegistryPath(), "utf8");
    const data = JSON.parse(raw);
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return data as Record<string, string>;
    }
  } catch {
    // file missing or invalid
  }
  return {};
}

function saveRegistry(registry: Record<string, string>): void {
  fs.writeFileSync(getRegistryPath(), JSON.stringify(registry, null, 2), "utf8");
}

export function setUploadPath(uploadId: string, absolutePath: string): void {
  uploads.set(uploadId, absolutePath);
  const registry = loadRegistry();
  registry[uploadId] = absolutePath;
  saveRegistry(registry);
}

export function getUploadPath(uploadId: string): string | undefined {
  let p = uploads.get(uploadId);
  if (p) return p;
  const registry = loadRegistry();
  p = registry[uploadId];
  if (p) {
    uploads.set(uploadId, p);
    return p;
  }
  return undefined;
}

export function deleteUpload(uploadId: string): void {
  uploads.delete(uploadId);
  const registry = loadRegistry();
  delete registry[uploadId];
  saveRegistry(registry);
}
