"use client";

import { useState, useEffect } from "react";

interface Contact {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  lead_score: number;
  status: string;
  created_at: string;
  contacts: Contact[];
}

const columns = [
  { id: "NEW", label: "New", color: "text-neutral-300" },
  { id: "PITCHED", label: "Pitched", color: "text-neutral-400" },
  { id: "REPLIED", label: "Replied", color: "text-green-500" },
  { id: "REJECTED", label: "Rejected", color: "text-red-500" },
];

export default function ProspectsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prospects")
      .then(r => r.json())
      .then(data => { setCompanies(data.companies || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function getCompaniesByStatus(status: string) {
    return companies.filter(c => {
      if (status === "NEW") return !c.status || c.status === "NEW" || c.status === "DISCOVERED";
      return c.status === status;
    });
  }

  async function handleDragStart(e: React.DragEvent, companyId: string) {
    setDraggedId(companyId);
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    if (!draggedId) return;
    try {
      await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: draggedId, status: newStatus }),
      });
      setCompanies(prev => prev.map(c => c.id === draggedId ? { ...c, status: newStatus } : c));
    } catch {}
    setDraggedId(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Prospects</h1>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 min-h-[400px] p-3 animate-pulse">
              <div className="h-4 w-20 bg-neutral-800 rounded mb-3" />
              <div className="space-y-2">
                {[1,2,3].map(j => <div key={j} className="h-16 bg-neutral-800 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => {
            const colCompanies = getCompaniesByStatus(col.id);
            return (
              <div key={col.id} onDrop={(e) => handleDrop(e, col.id)} onDragOver={handleDragOver}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                  <span className="text-xs text-neutral-500 font-mono">{colCompanies.length}</span>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 min-h-[400px] p-3 space-y-2">
                  {colCompanies.length === 0 ? (
                    <p className="text-xs text-neutral-600 text-center mt-8">
                      {col.id === "NEW" ? "No new prospects" : `No ${col.label.toLowerCase()} leads`}
                    </p>
                  ) : (
                    colCompanies.map((company) => (
                      <div
                        key={company.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, company.id)}
                        className="rounded-lg bg-neutral-950 border border-neutral-800 p-3 cursor-grab active:cursor-grabbing hover:border-neutral-700 transition-colors grain-card"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center">
                            <span className="text-xs text-neutral-400">
                              {company.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-paper-100 truncate">
                            {company.name || "Unknown"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mb-1">
                          {company.industry || company.website || ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {company.contacts?.[0]?.email || ""}
                          </span>
                          {company.lead_score > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              company.lead_score >= 70 ? "bg-green-500/10 text-green-500" :
                              company.lead_score >= 40 ? "bg-neutral-700 text-neutral-300" :
                              "bg-neutral-800 text-neutral-500"
                            }`}>
                              {company.lead_score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
