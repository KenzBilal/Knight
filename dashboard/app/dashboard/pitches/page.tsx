"use client";

import { useState, useEffect } from "react";

interface Company {
  id: string;
  name: string;
  website_url: string;
  logo_url?: string;
  industry: string;
  lead_score: number;
  status: string;
  ai_pitch: string | null;
  created_at: string;
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#4ade80]/10 text-[#4ade80]">{score}</span>;
  if (score >= 40) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#a3a3a3]">{score}</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f87171]/10 text-[#f87171]">{score}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; text: string; label: string }> = {
    PITCHED: { bg: "bg-[#60a5fa]/10", text: "text-[#60a5fa]", label: "Pitched" },
    REPLIED: { bg: "bg-[#4ade80]/10", text: "text-[#4ade80]", label: "Replied" },
    REJECTED: { bg: "bg-[#f87171]/10", text: "text-[#f87171]", label: "Rejected" },
    NEW: { bg: "bg-white/[0.06]", text: "text-[#525252]", label: "New" },
  };
  const st = s[status] || s.NEW;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.text.replace("text-", "bg-")}`} />
      {st.label}
    </span>
  );
}

export default function PitchesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Company | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((d) => {
        const withPitch = (d.companies || []).filter((c: Company) => c.ai_pitch);
        setCompanies(withPitch);
        if (withPitch.length > 0) setSelected(withPitch[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleCopy() {
    if (!selected?.ai_pitch) return;
    navigator.clipboard.writeText(selected.ai_pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 md:p-8">
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="dash-card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 bg-white/[0.04] rounded" />
                    <div className="h-2.5 w-20 bg-white/[0.04] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-2">
            <div className="dash-card p-6 animate-pulse">
              <div className="h-5 w-40 bg-white/[0.04] rounded mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-white/[0.02] rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">No pitches yet</p>
          <p className="text-xs text-[#525252]">Pitches are generated automatically after audits complete.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* List */}
          <div className="md:col-span-1 space-y-1">
            <p className="text-[11px] font-medium text-[#525252] uppercase tracking-wider px-2 mb-2">
              {companies.length} pitches
            </p>
            {companies.map((c) => {
              const isActive = selected?.id === c.id;
              const statusColors: Record<string, string> = {
                PITCHED: "border-l-[#60a5fa]",
                REPLIED: "border-l-[#4ade80]",
                REJECTED: "border-l-[#f87171]",
                NEW: "border-l-[#525252]",
              };
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left rounded-lg p-4 transition-all duration-150 border-l-2 ${
                    isActive
                      ? `bg-white/[0.06] ${statusColors[c.status] || "border-l-[#525252]"}`
                      : `border-l-transparent hover:bg-white/[0.04] hover:border-l-white/[0.08]`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden ${
                      isActive ? "bg-white/[0.1]" : "bg-white/[0.06]"
                    }`}>
                      {c.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-[#a3a3a3]">{c.name?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] font-medium truncate block ${isActive ? "text-white" : "text-[#a3a3a3]"}`}>
                        {c.name}
                      </span>
                      <p className="text-[11px] text-[#525252] truncate mt-0.5">{c.industry}</p>
                    </div>
                    <ScoreBadge score={c.lead_score} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="md:col-span-2">
            {selected ? (
              <div className="dash-card">
                {/* Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-white">{selected.name}</h2>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-xs text-[#525252]">{selected.industry} · {selected.website_url}</p>
                </div>

                {/* Pitch content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-medium text-[#525252] uppercase tracking-wider">Generated Pitch</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#525252] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
                    >
                      {copied ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-5 border border-white/[0.04]">
                    <pre className="text-sm text-[#a3a3a3] leading-relaxed whitespace-pre-wrap font-sans">
                      {selected.ai_pitch}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-card p-6 flex flex-col items-center justify-center h-64">
                <p className="text-sm text-[#3a3a3a]">Select a pitch to preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
