"use client";

export default function AuditsPage() {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Audits</h1>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center grain-card">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm text-neutral-500">No audits yet. Run a discovery to see results.</p>
      </div>
    </div>
  );
}
