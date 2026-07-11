"use client";

import { useState, useEffect } from "react";

interface Contact { id: string; email: string; full_name: string; role: string; }
interface Company {
  id: string; name: string; website_url: string;
  industry: string; lead_score: number; status: string;
  created_at: string; contacts: Contact[];
}

const columns = [
  { id: "NEW",      label: "New",      dot: "bg-[#aaa]",     count_bg: "bg-[#f0f0f0] text-[#999]" },
  { id: "PITCHED",  label: "Pitched",  dot: "bg-blue-400",   count_bg: "bg-blue-50 text-blue-400" },
  { id: "REPLIED",  label: "Replied",  dot: "bg-green-500",  count_bg: "bg-green-50 text-green-500" },
  { id: "REJECTED", label: "Rejected", dot: "bg-red-400",    count_bg: "bg-red-50 text-red-400" },
];

function ScoreBadge({ score }: { score: number }) {
  if (score < 40) return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">{score}</span>;
  if (score < 70) return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#888]">{score}</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">{score}</span>;
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
      .then((d) => { setCompanies(d.companies || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function getByStatus(status: string) {
    const filtered = companies.filter((c) =>
      status === "NEW"
        ? !c.status || c.status === "NEW" || c.status === "DISCOVERED"
        : c.status === status
    );
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (c) => c.name?.toLowerCase().includes(q) ||
             c.industry?.toLowerCase().includes(q) ||
             c.website_url?.toLowerCase().includes(q)
    );
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() { setDraggedId(null); setDragOver(null); }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    if (!draggedId) return;
    const prev = companies;
    setCompanies((c) => c.map((x) => x.id === draggedId ? { ...x, status: newStatus } : x));
    setDraggedId(null); setDragOver(null);
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: draggedId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch { setCompanies(prev); }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search prospects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] rounded-full pl-9 pr-4 py-2.5 text-sm text-[#333] placeholder:text-[#aaa] focus:outline-none focus:bg-white focus:shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#aaa] bg-white rounded-full px-4 py-2.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Score &lt; 40 = hot lead
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#ebebeb] min-h-[480px] p-4 animate-pulse">
              <div className="h-3 w-16 bg-[#f0f0f0] rounded mb-4"/>
              <div className="space-y-2.5">
                {[1,2,3].map((j) => <div key={j} className="h-16 bg-[#f7f7f7] rounded-xl"/>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const items = getByStatus(col.id);
            const isOver = dragOver === col.id;
            return (
              <div
                key={col.id}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`}/>
                  <span className="text-sm font-semibold text-[#333]">{col.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${col.count_bg}`}>
                    {items.length}
                  </span>
                </div>

                {/* Column body */}
                <div className={`min-h-[520px] rounded-2xl p-3 space-y-3 transition-all duration-150 ${
                  isOver
                    ? "bg-[#e8e8e8] border-2 border-dashed border-[#ccc]"
                    : "bg-[#ececec] border-2 border-transparent"
                }`}>
                  {items.length === 0 ? (
                    <div className="text-center mt-14">
                      <p className="text-xs text-[#ccc]">
                        {search ? "No matches" : col.id === "NEW" ? "No new prospects" : `No ${col.label.toLowerCase()} leads`}
                      </p>
                    </div>
                  ) : items.map((company) => (
                    <div
                      key={company.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, company.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 select-none ${
                        draggedId === company.id ? "opacity-40 scale-95" : ""
                      }`}
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
                    >
                      {/* Company name */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-[#555]">
                            {company.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[#111] truncate">
                          {company.name || "Unknown"}
                        </span>
                      </div>

                      {/* Industry */}
                      {(company.industry || company.website_url) && (
                        <p className="text-[11px] text-[#aaa] truncate mb-2">
                          {company.industry || company.website_url}
                        </p>
                      )}

                      {/* Contact + score */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#f0f0f0]">
                        <span className="text-[11px] text-[#bbb] truncate">
                          {company.contacts?.[0]?.email || "No email"}
                        </span>
                        {company.lead_score > 0 && (
                          <ScoreBadge score={company.lead_score} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
