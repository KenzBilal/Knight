"use client";

export default function AuditsPage() {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Audits</h1>
      <div className="rounded-xl border border-line bg-ink-900 p-12 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm text-paper-400">No audits yet. Run a discovery to see results.</p>
      </div>
    </div>
  );
}
