import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ClaimProvider } from "@/context/ClaimContext";

export const metadata: Metadata = {
  title: "Claim Generator UI",
  description: "Claim Field Mapping and Claim Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50">
        <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex gap-6 shadow-sm">
          <Link href="/" className="text-slate-200 hover:text-white font-medium transition-colors">
            Home
          </Link>
          <Link href="/mapping" className="text-slate-200 hover:text-white font-medium transition-colors">
            Claim Field Mapping
          </Link>
          <Link href="/generator" className="text-slate-200 hover:text-white font-medium transition-colors">
            Claim Generator
          </Link>
        </nav>
        <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
          <ClaimProvider>{children}</ClaimProvider>
        </main>
      </body>
    </html>
  );
}
