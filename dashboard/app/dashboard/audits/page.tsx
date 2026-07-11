"use client";

export default function AuditsPage() {
  return (
    <div className="p-6 md:p-8">
      <div
        className="bg-white rounded-2xl p-12 text-center"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm text-[#999]">No audits yet. Run a discovery to see results.</p>
      </div>
    </div>
  );
}
