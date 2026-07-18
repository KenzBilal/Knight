"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Contact { id: string; email: string; full_name: string; role: string; bio?: string; }
interface Company {
  id: string; name: string; website_url: string; logo_url?: string;
  industry: string; lead_score: number; status: string;
  created_at: string; contacts: Contact[];
}

const columns = [
  { id: "NEW",      label: "New",      dot: "bg-[#525252]" },
  { id: "PITCHED",  label: "Pitched",  dot: "bg-[#60a5fa]" },
  { id: "REPLIED",  label: "Replied",  dot: "bg-[#4ade80]" },
  { id: "REJECTED", label: "Rejected", dot: "bg-[#f87171]" },
];

const sortOptions = [
  { value: "score", label: "Score" },
  { value: "name",  label: "Name" },
  { value: "date",  label: "Date" },
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#4ade80]/10 text-[#4ade80]">{score}</span>;
  if (score >= 40) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#a3a3a3]">{score}</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f87171]/10 text-[#f87171]">{score}</span>;
}

export default function ProspectsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<Record<string, string>>({});
  const dragImageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; el: HTMLElement } | null>(null);

  useEffect(() => {
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((d) => { setCompanies(d.companies || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getByStatus = useCallback((status: string) => {
    const filtered = companies.filter((c) =>
      status === "NEW"
        ? !c.status || c.status === "NEW" || c.status === "DISCOVERED"
        : c.status === status
    );
    const q = search.toLowerCase().trim();
    const matched = q
      ? filtered.filter(
          (c) => c.name?.toLowerCase().includes(q) ||
                 c.industry?.toLowerCase().includes(q) ||
                 c.website_url?.toLowerCase().includes(q) ||
                 c.contacts?.some(ct => ct.email?.toLowerCase().includes(q) || ct.full_name?.toLowerCase().includes(q))
        )
      : filtered;
    const sort = sortBy[status] || "score";
    return [...matched].sort((a, b) => {
      if (sort === "score") return (b.lead_score || 0) - (a.lead_score || 0);
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [companies, search, sortBy]);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";

    const el = e.currentTarget as HTMLElement;
    dragRef.current = { id, el };

    // Custom drag image
    const clone = el.cloneNode(true) as HTMLDivElement;
    clone.style.cssText = "width:280px;opacity:0.92;position:absolute;top:-9999px;left:-9999px;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.5);";
    document.body.appendChild(clone);
    dragImageRef.current = clone;
    e.dataTransfer.setDragImage(clone, 140, 30);
  }

  function handleDragEnd() {
    if (dragImageRef.current) {
      dragImageRef.current.remove();
      dragImageRef.current = null;
    }
    dragRef.current = null;
    setDraggedId(null);
    setDragOver(null);
    setDropTarget(null);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOver !== colId) setDragOver(colId);

    // Determine drop position (top or bottom half of hovered card)
    const hoveredCard = (e.target as HTMLElement).closest("[data-card-id]");
    if (hoveredCard) {
      const cardRect = hoveredCard.getBoundingClientRect();
      const cardMid = cardRect.top + cardRect.height / 2;
      const pos = e.clientY < cardMid ? "top" : "bottom";
      setDropTarget(`${hoveredCard.getAttribute("data-card-id")}-${pos}`);
    } else {
      setDropTarget(null);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the column entirely
    const related = e.relatedTarget as HTMLElement;
    const current = e.currentTarget as HTMLElement;
    if (related && current.contains(related)) return;
    setDragOver(null);
    setDropTarget(null);
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    const id = dragRef.current?.id || draggedId;
    if (!id) return;

    const prev = companies;
    setCompanies((c) => c.map((x) => x.id === id ? { ...x, status: newStatus } : x));
    setDraggedId(null);
    setDragOver(null);
    setDropTarget(null);

    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id, status: newStatus }),
      });
      if (!res.ok) throw new Error();

      const colLabel = columns.find(c => c.id === newStatus)?.label || newStatus;
      const movedCompany = companies.find(x => x.id === id);
      toast.success(
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              <span className="text-[#a3a3a3]">{movedCompany?.name || "Company"}</span>
              {" → "}
              <span className="text-[#4ade80]">{colLabel}</span>
            </p>
          </div>
        </div>,
        {
          duration: 5000,
          action: {
            label: "Undo",
            onClick: () => {
              setCompanies(prev);
              fetch("/api/prospects", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId: id, status: prev.find(x => x.id === id)?.status || "NEW" }),
              });
            },
          },
          style: {
            background: "rgba(17, 17, 17, 0.95)",
            border: "1px solid rgba(74, 222, 128, 0.15)",
            borderRadius: "12px",
            padding: "14px 16px",
          },
          classNames: {
            success: "!bg-[#4ade80]/5 !border-[#4ade80]/15 !text-white",
          },
        }
      );
    } catch {
      setCompanies(prev);
      toast.error(
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white">Move failed</p>
            <p className="text-[11px] text-[#a3a3a3]">Reverted</p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: "rgba(17, 17, 17, 0.95)",
            border: "1px solid rgba(248, 113, 113, 0.15)",
            borderRadius: "12px",
            padding: "14px 16px",
          },
          classNames: {
            error: "!bg-[#f87171]/5 !border-[#f87171]/15 !text-white",
          },
        }
      );
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, industry, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full input-base rounded-lg pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#525252] dash-card rounded-lg px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] inline-block" />
          Higher score = better fit
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="dash-card rounded-lg min-h-[480px] p-4 animate-pulse">
              <div className="h-3 w-16 bg-white/[0.04] rounded mb-4"/>
              <div className="space-y-2.5">
                {[1,2,3].map((j) => <div key={j} className="h-16 bg-white/[0.02] rounded-lg"/>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const items = getByStatus(col.id);
            const isOver = dragOver === col.id;
            const colSort = sortBy[col.id] || "score";
            return (
              <div
                key={col.id}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`}/>
                  <span className="text-sm font-medium text-[#a3a3a3]">{col.label}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#525252] ml-auto">
                    {items.length}
                  </span>
                  {/* Sort dropdown */}
                  <select
                    value={colSort}
                    onChange={(e) => setSortBy(prev => ({ ...prev, [col.id]: e.target.value }))}
                    className="text-[10px] bg-white/[0.04] text-[#525252] border border-white/[0.06] rounded px-1.5 py-0.5 appearance-none cursor-pointer hover:border-white/[0.12] transition-colors"
                  >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Column body */}
                <div className={`min-h-[520px] rounded-lg p-3 space-y-3 transition-all duration-150 ${
                  isOver
                    ? "bg-white/[0.04] border border-dashed border-white/[0.15]"
                    : "bg-white/[0.02] border border-transparent"
                }`}>
                  {items.length === 0 ? (
                    <div className="text-center mt-14">
                      <p className="text-xs text-[#3a3a3a] mb-2">
                        {search ? "No matches" : col.id === "NEW" ? "No new prospects" : `No ${col.label.toLowerCase()} leads`}
                      </p>
                      {!search && (
                        <a href="/dashboard/prospects" className="text-[11px] text-[#525252] hover:text-white transition-colors underline underline-offset-2">
                          Discover leads
                        </a>
                      )}
                    </div>
                  ) : items.map((company) => {
                    const contact = company.contacts?.[0];
                    const age = timeAgo(company.created_at);
                    const dropHere = dropTarget === `${company.id}-top`;
                    const dropBelow = dropTarget === `${company.id}-bottom`;
  async function handleDelete(companyId: string, companyName: string) {
    if (!confirm(`Delete ${companyName} and all its data (audits, contacts, emails)?`)) return;

    try {
      const res = await fetch("/api/prospects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error();
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      toast.success(`${companyName} deleted`);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
                      <div key={company.id}>
                        {/* Drop indicator line — top */}
                        {dropHere && <div className="h-0.5 bg-[#60a5fa] rounded-full mb-2 mx-2" />}

                        <div
                          data-card-id={company.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, company.id)}
                          onDragEnd={handleDragEnd}
                          className={`dash-card p-3.5 cursor-grab active:cursor-grabbing dash-card-hover transition-all duration-150 select-none ${
                            draggedId === company.id ? "opacity-40 scale-[0.96]" : ""
                          }`}
                        >
                          {/* Company name + age */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {company.logo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-semibold text-[#a3a3a3]">
                                    {company.name?.[0]?.toUpperCase() || "?"}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-white truncate">
                                {company.name || "Unknown"}
                              </span>
                            </div>
                            {age && (
                              <span className="text-[10px] text-[#3a3a3a] flex-shrink-0">{age}</span>
                            )}
                          </div>

                          {/* Contact name */}
                          {contact?.full_name && (
                            <p className="text-[11px] text-[#525252] truncate ml-9 mb-0.5">
                              {contact.full_name} {contact.bio && <span className="text-[#3a3a3a]">· {contact.bio}</span>}
                            </p>
                          )}

                          {/* Industry */}
                          {(company.industry || company.website_url) && (
                            <p className="text-[11px] text-[#525252] truncate ml-9 mb-1">
                              {company.industry || company.website_url}
                            </p>
                          )}

                          {/* Contact email + score */}
                          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                            <span className="text-[11px] text-[#3a3a3a] truncate">
                              {contact?.email || "No email"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {company.lead_score > 0 && (
                                <ScoreBadge score={company.lead_score} />
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(company.id, company.name); }}
                                className="p-1 rounded hover:bg-[#f87171]/10 text-[#3a3a3a] hover:text-[#f87171] transition-colors"
                                title="Delete"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Drop indicator line — bottom */}
                        {dropBelow && <div className="h-0.5 bg-[#60a5fa] rounded-full mt-2 mx-2" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
