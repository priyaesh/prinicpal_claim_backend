"use client";

import { useState, useCallback, useEffect } from "react";
import { useClaim } from "@/context/ClaimContext";
import { MOCK_EMPLOYEES, type EmployeeData } from "@/data/mockEmployees";

const EMPLOYEE_KEYS: (keyof EmployeeData)[] = [
  "employeeName",
  "employeeId",
  "phone",
  "address",
  "city",
  "dateOfBirth",
  "state",
  "zipCode",
  "ssn",
  "jobTitle",
  "checkbox1",
  "checkbox2",
  "checkbox3",
];

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

export default function GeneratorPage() {
  const { uploadId } = useClaim();
  const [selected, setSelected] = useState<EmployeeData | null>(null);
  const [savedMappings, setSavedMappings] = useState<string[]>([]);
  const [selectedMappingName, setSelectedMappingName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mappings")
      .then((res) => res.json())
      .then((data) => {
        if (data.mappings && Array.isArray(data.mappings)) setSavedMappings(data.mappings);
      })
      .catch(() => setSavedMappings([]));
  }, []);

  const canGenerate = Boolean(uploadId && selected && selectedMappingName);

  const handleSelectEmployee = useCallback((employeeId: string) => {
    if (!employeeId) {
      setSelected(null);
      return;
    }
    const emp = MOCK_EMPLOYEES.find((e) => e.employeeId === employeeId);
    setSelected(emp ?? null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !selected || !selectedMappingName) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          mappingName: selectedMappingName,
          employeeData: selected,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generate failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeMappingName =
        selectedMappingName?.trim().replace(/[^a-zA-Z0-9_-]/g, "") || "";
      a.download = safeMappingName ? `filled-claim-${safeMappingName}.pdf` : "filled-claim.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [canGenerate, selected, uploadId, selectedMappingName]);

  const cardClass = "bg-white border border-slate-200 rounded-lg shadow-sm p-6";
  const sectionTitleClass = "text-base font-semibold text-slate-800 mb-4";
  const formControlClass =
    "border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none w-full max-w-md";
  const labelClass = "text-sm font-medium text-slate-700";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Claim Generator</h1>

      {!uploadId && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          Upload a PDF in Claim Field Mapping first, then return here to generate a PDF.
        </div>
      )}

      <section className={cardClass}>
        <h2 className={sectionTitleClass}>Select employee</h2>
        <label htmlFor="employee-select" className={labelClass + " block mb-2"}>
          Employee
        </label>
        <select
          id="employee-select"
          value={selected?.employeeId ?? ""}
          onChange={(e) => handleSelectEmployee(e.target.value)}
          className={formControlClass}
        >
          <option value="">— Select an employee —</option>
          {MOCK_EMPLOYEES.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.employeeName} ({emp.employeeId})
            </option>
          ))}
        </select>
      </section>

      <section className={cardClass}>
        <h2 className={sectionTitleClass}>Select mapping</h2>
        {savedMappings.length === 0 ? (
          <p className="text-slate-600 text-sm">
            No saved mappings. Save a mapping in Claim Field Mapping first.
          </p>
        ) : (
          <>
            <label htmlFor="mapping-select" className={labelClass + " block mb-2"}>
              Mapping
            </label>
            <select
              id="mapping-select"
              value={selectedMappingName ?? ""}
              onChange={(e) => setSelectedMappingName(e.target.value || null)}
              className={formControlClass}
            >
              <option value="">— Select a mapping —</option>
              {savedMappings.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </>
        )}
      </section>

      {selected && (
        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Employee details</h2>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="min-w-full text-sm">
              <tbody>
                {EMPLOYEE_KEYS.map((key) => (
                  <tr key={key} className="border-t border-slate-200 first:border-t-0">
                    <td className="px-4 py-3 bg-slate-50 font-medium text-slate-700 w-1/3">
                      {formatLabel(key)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {typeof selected[key] === "boolean"
                        ? selected[key]
                          ? "Yes"
                          : "No"
                        : String(selected[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? "Generating…" : "Generate PDF"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
