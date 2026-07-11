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
  website_url: string;
  industry: string;
  lead_score: number;
  status: string;
  created_at: string;
  contacts: Contact[];
}

const columns = [
  { id: "NEW",      label: "New",      color: "text-[#a3a3a3]", dot: "bg-[#3a3a3a]" },
  { id: "PITCHED",  label: "Pitched",  color: "text-[#737373]", dot: "bg-[#525252]" },
  { id: "REPLIED",  label: "Replied",  color: "text-[#4ade80]", dot: "bg-[#4ade80]" },
  { id: "REJECTED", label: "Rejected", color: "text-[#f87171]", dot: "bg-[#f87171]" },
];

function ScoreBadge({ score }: { score: number }) {
  // Lower score = worse site = hotter lead
  if (score < 40)
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f87171]/[0.1] text-[#f87171]">
        {score}
      </span>
    );
  if (score < 70)
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-[#737373]">
        {score}
      </span>
    );
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#4ade80]/[0.08] text-[#4ade80]">
      {score}
    </span>
  );
}

export default function ProspectsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getCompaniesByStatus(status: string) {
    const filtered = companies.filter((c) => {
      if (status === "NEW")
        return !c.status || c.status === "NEW" || c.status === "DISCOVERED";
      return c.status === status;
    });
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.website_url?.toLowerCase().includes(q)
    );
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  // Bug fix: always clear draggedId, even if drop target is invalid
  function handleDragEnd() {
    setDraggedId(null);
    setDragOver(null);
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    if (!draggedId) return;
    const prevCompanies = companies;
    // Optimistic update
    setCompanies((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, status: newStatus } : c))
    );
    setDraggedId(null);
    setDragOver(null);
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: draggedId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      // Rollback on failure
      setCompanies(prevCompanies);
    }
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(colId);
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-xs">
          <svg
            width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a3a3a]"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search prospects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#3a3a3a]">
          <span className="text-[#f87171]">●</span> Hot lead (score &lt; 40)
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card min-h-[480px] p-3 animate-pulse"
            >
              <div className="h-3 w-16 bg-white/[0.04] rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-white/[0.03] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {columns.map((col) => {
            const colCompanies = getCompaniesByStatus(col.id);
            const isOver = dragOver === col.id;
            return (
              <div
                key={col.id}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOver(null)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  <h3 className={`text-xs font-medium ${col.color}`}>
                    {col.label}
                  </h3>
                  <span className="text-[10px] text-[#2a2a2a] font-mono">
                    {colCompanies.length}
                  </span>
                </div>

                {/* Column */}
                <div
                  className={`rounded-xl min-h-[480px] p-2 space-y-2 transition-colors ${
                    isOver
                      ? "bg-white/[0.03] border border-white/[0.08]"
                      : "border border-white/[0.04] bg-[#0a0a0a]"
                  }`}
                >
                  {colCompanies.length === 0 ? (
                    <div className="text-center mt-12">
                      <p className="text-xs text-[#2a2a2a]">
                        {search ? "No matches" : col.id === "NEW" ? "No new prospects" : `No ${col.label.toLowerCase()}`}
                      </p>
                    </div>
                  ) : (
                    colCompanies.map((company) => (
                      <div
                        key={company.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, company.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg bg-[#0f0f0f] border border-white/[0.05] p-3 cursor-grab active:cursor-grabbing hover:border-white/[0.1] transition-all duration-150 ${
                          draggedId === company.id ? "opacity-40" : ""
                        }`}
                      >
                        {/* Company name */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-mono text-[#525252]">
                              {company.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#d4d4d4] truncate">
                            {company.name || "Unknown"}
                          </span>
                        </div>

                        {/* Industry / domain */}
                        <p className="text-[11px] text-[#3a3a3a] truncate mb-2">
                          {company.industry || company.website_url || ""}
                        </p>

                        {/* Contact + score */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#2a2a2a] truncate">
                            {company.contacts?.[0]?.email || "No email"}
                          </span>
                          {company.lead_score > 0 && (
                            <ScoreBadge score={company.lead_score} />
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
