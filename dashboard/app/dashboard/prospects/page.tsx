"use client";

const columns = [
  { id: "NEW", label: "New", color: "text-paper-300" },
  { id: "PITCHED", label: "Pitched", color: "text-flash-500" },
  { id: "REPLIED", label: "Replied", color: "text-success-500" },
  { id: "REJECTED", label: "Rejected", color: "text-danger-500" },
];

export default function ProspectsPage() {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Prospects</h1>

      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
              <span className="text-xs text-paper-400 font-mono">0</span>
            </div>
            <div className="rounded-xl border border-line bg-ink-900/50 min-h-[400px] p-3">
              <p className="text-xs text-paper-400 text-center mt-8">No prospects yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
