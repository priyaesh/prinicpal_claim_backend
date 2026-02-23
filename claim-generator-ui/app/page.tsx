import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Claim Generator UI</h1>
        <p className="text-slate-600 text-sm mb-6">
          Map PDF form fields to unified data, then generate filled PDFs for selected employees.
        </p>
        <ul className="space-y-3">
          <li>
            <Link
              href="/mapping"
              className="text-slate-700 font-medium hover:text-slate-900 transition-colors underline underline-offset-2"
            >
              Claim Field Mapping
            </Link>
            <span className="text-slate-600 text-sm ml-1">
              — Upload a PDF, parse fields, and configure semantic → field index mapping.
            </span>
          </li>
          <li>
            <Link
              href="/generator"
              className="text-slate-700 font-medium hover:text-slate-900 transition-colors underline underline-offset-2"
            >
              Claim Generator
            </Link>
            <span className="text-slate-600 text-sm ml-1">
              — Select an employee and generate a filled PDF using your mapping.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
