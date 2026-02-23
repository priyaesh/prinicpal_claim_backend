"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useClaim, SEMANTIC_KEYS } from "@/context/ClaimContext";
import type { FieldMap } from "@/context/ClaimContext";

type FieldEntry = { index: number; type: string; name: string; page: number | null };

function buildFieldMappingForApi(fieldMap: FieldMap): Record<string, number | number[]> {
  const out: Record<string, number | number[]> = {};
  for (const [key, value] of Object.entries(fieldMap)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0 && value.every((n) => typeof n === "number")) out[key] = value;
    } else if (typeof value === "number" && value >= 0) {
      out[key] = value;
    }
  }
  return out;
}

const MULTI_FIELD_KEYS = ["ssn", "phone", "dateOfBirth"];
const PAGE_SIZES = [10, 25, 50];

export default function MappingPage() {
  const { uploadId, fieldMap, setUploadId, setFieldMapping } = useClaim();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldEntry[]>([]);
  const [formName, setFormName] = useState<string>("");
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saveName, setSaveName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [multiFieldDraft, setMultiFieldDraft] = useState<Record<string, string>>({});

  const filteredFields = useMemo(() => {
    const list = !filterText.trim()
      ? [...fields]
      : (() => {
          const q = filterText.trim().toLowerCase();
          return fields.filter(
            (f) =>
              String(f.index).toLowerCase().includes(q) ||
              f.type.toLowerCase().includes(q) ||
              f.name.toLowerCase().includes(q) ||
              String(f.page ?? "").toLowerCase().includes(q)
          );
        })();
    return list.sort((a, b) => {
      const pa = a.page ?? 999999;
      const pb = b.page ?? 999999;
      if (pa !== pb) return pa - pb;
      return a.index - b.index;
    });
  }, [fields, filterText]);

  const totalPages = Math.max(1, Math.ceil(filteredFields.length / pageSize));
  const pageFields = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFields.slice(start, start + pageSize);
  }, [filteredFields, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Select a PDF file first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/list-fields", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadId(data.uploadId);
      setFormName(data.formName || "unknown");
      setFields(data.fields || []);
      setFilterText("");
      setCurrentPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [file, setUploadId]);

  const handleSingleMapping = (key: string, indexStr: string) => {
    const num = parseInt(indexStr, 10);
    if (indexStr === "" || isNaN(num)) return;
    setFieldMapping(key, num);
  };

  const handleMultiMapping = (key: string, valueStr: string) => {
    setMultiFieldDraft((prev) => ({ ...prev, [key]: valueStr }));
    const parts = valueStr.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    setFieldMapping(key, parts);
  };

  const clearMultiFieldDraft = (key: string) => {
    setMultiFieldDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const savedFieldMap = useMemo(() => buildFieldMappingForApi(fieldMap), [fieldMap]);
  const hasMapping = Object.keys(savedFieldMap).length > 0;

  const handleSaveMapping = useCallback(async () => {
    const name = saveName.trim();
    if (!name || !hasMapping) return;
    setSaveError(null);
    setSaveStatus(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/save-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fieldMap: savedFieldMap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveStatus(`Mapping saved as ${data.name}.json in templates/mappings.`);
      setSaveError(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
      setSaveStatus(null);
    } finally {
      setSaveLoading(false);
    }
  }, [saveName, savedFieldMap, hasMapping]);

  const formControlClass =
    "border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none";
  const labelClass = "text-sm font-medium text-slate-700";
  const cardClass = "bg-white border border-slate-200 rounded-lg shadow-sm p-6";
  const sectionTitleClass = "text-base font-semibold text-slate-800 mb-4";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Claim Field Mapping</h1>

      <section className={cardClass}>
        <h2 className={sectionTitleClass}>1. Upload PDF template</h2>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
            className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-200 file:text-slate-800"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? "Processing…" : "Parse fields"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {uploadId && (
          <p className="mt-3 text-sm text-slate-600">
            Template loaded (use Claim Generator to create PDFs with this template).
          </p>
        )}
      </section>

      {fields.length > 0 && (
        <>
          <section className={cardClass}>
            <h2 className={sectionTitleClass}>2. Parsed fields (form: {formName})</h2>

            <div className="mb-4">
              <label htmlFor="filter-fields" className={labelClass + " block mb-1"}>
                Filter by index, type, name, or page
              </label>
              <input
                id="filter-fields"
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Type to filter…"
                className={formControlClass + " w-full max-w-md"}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-sm text-slate-600">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredFields.length)} of {filteredFields.length} fields
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Page size
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={formControlClass + " py-1.5"}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Index</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Page</th>
                  </tr>
                </thead>
                <tbody>
                  {pageFields.map((f) => (
                    <tr key={f.index} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{f.index}</td>
                      <td className="px-4 py-3 text-slate-600">{f.type}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={f.name}>
                        {f.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{f.page ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitleClass}>3. Configure mapping (semantic key → field index)</h2>
            <p className="text-slate-600 text-sm mb-4">
              Map each unified-data key to one field index, or comma-separated indices for SSN, phone, dateOfBirth.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {SEMANTIC_KEYS.map((key) => {
                const isMulti = MULTI_FIELD_KEYS.includes(key);
                const current = fieldMap[key];
                const valueStr = Array.isArray(current)
                  ? current.join(", ")
                  : current !== undefined && current !== null
                    ? String(current)
                    : "";
                const multiDisplayValue = multiFieldDraft[key] !== undefined ? multiFieldDraft[key] : valueStr;
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className={labelClass}>{key}</label>
                    {isMulti ? (
                      <input
                        type="text"
                        placeholder="e.g. 1, 2, 3"
                        value={multiDisplayValue}
                        onChange={(e) => handleMultiMapping(key, e.target.value)}
                        onBlur={() => clearMultiFieldDraft(key)}
                        className={formControlClass}
                      />
                    ) : (
                      <select
                        value={valueStr}
                        onChange={(e) => handleSingleMapping(key, e.target.value)}
                        className={formControlClass}
                      >
                        <option value="">— Select index —</option>
                        {fields.map((f) => (
                          <option key={f.index} value={f.index}>
                            {f.index}: {f.name.length > 40 ? f.name.slice(0, 40) + "…" : f.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <label htmlFor="save-mapping-name" className={labelClass + " block mb-2"}>
                Save mapping to templates folder
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="save-mapping-name"
                  type="text"
                  value={saveName}
                  onChange={(e) => {
                    setSaveName(e.target.value);
                    setSaveError(null);
                    setSaveStatus(null);
                  }}
                  placeholder="e.g. principal-2025 or shelterpoint-mapping"
                  className={formControlClass + " max-w-xs"}
                />
                <button
                  type="button"
                  onClick={handleSaveMapping}
                  disabled={!saveName.trim() || !hasMapping || saveLoading}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {saveLoading ? "Saving…" : "Save the mapping"}
                </button>
              </div>
              {saveStatus && (
                <p className="mt-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {saveStatus}
                </p>
              )}
              {saveError && (
                <p className="mt-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {saveError}
                </p>
              )}
            </div>
            <p className="mt-4 text-slate-600 text-sm">
              Saved mappings can be selected in Claim Generator when generating a PDF.
            </p>
          </section>
        </>
      )}

      <div className="pt-4">
        <Link
          href="/generator"
          className="inline-flex items-center px-5 py-2.5 bg-slate-700 text-white rounded-md hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Continue to Claim Generator
        </Link>
      </div>
    </div>
  );
}
