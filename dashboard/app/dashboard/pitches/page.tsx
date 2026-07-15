"use client";

import { useState, useEffect } from "react";

interface Company {
  id: string;
  name: string;
  website_url: string;
  industry: string;
  lead_score: number;
  status: string;
  ai_pitch: string | null;
  created_at: string;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#4ade80]/10 text-[#4ade80]">{score}</span>;
  if (score >= 40) return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#a3a3a3]">{score}</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f87171]/10 text-[#f87171]">{score}</span>;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PITCHED: "bg-[#60a5fa]",
    REPLIED: "bg-[#4ade80]",
    REJECTED: "bg-[#f87171]",
    NEW: "bg-[#525252]",
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[status] || colors.NEW}`} />;
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pitchLines = (text: string) => {
    const lines = text.split("\n").filter(Boolean);
    const subject = lines[0] || "";
    const body = lines.slice(1).join("\n").trim();
    return { subject, body };
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Pitches
          </h1>
          <p className="text-xs text-[#525252] mt-1">
            {companies.length} AI-generated emails ready to send
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#525252]">
          <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
          <span>Pitched</span>
          <span className="w-2 h-2 rounded-full bg-[#4ade80] ml-2" />
          <span>Replied</span>
          <span className="w-2 h-2 rounded-full bg-[#f87171] ml-2" />
          <span>Rejected</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-card p-6 animate-pulse">
              <div className="flex items-start gap-5">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04]" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 bg-white/[0.04] rounded" />
                  <div className="h-3 w-72 bg-white/[0.04] rounded" />
                  <div className="h-12 bg-white/[0.02] rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">No pitches yet</p>
          <p className="text-xs text-[#525252]">Run a discovery — pitches are generated automatically after audits complete.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => {
            const { subject } = pitchLines(c.ai_pitch || "");
            const isSelected = selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(isSelected ? null : c)}
                className={`w-full text-left dash-card p-5 transition-all duration-200 ${
                  isSelected
                    ? "bg-white/[0.04] ring-1 ring-white/[0.12]"
                    : "hover:bg-white/[0.02] dash-card-hover"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#a3a3a3]">{c.name?.[0]}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <StatusDot status={c.status} />
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                      <ScoreBadge score={c.lead_score} />
                      <span className="text-[10px] text-[#3a3a3a] ml-auto flex-shrink-0">{timeAgo(c.created_at)}</span>
                    </div>

                    <p className="text-xs text-[#525252] mb-2">{c.industry}</p>

                    {/* Subject line */}
                    <p className="text-[13px] text-[#a3a3a3] font-medium truncate">{subject}</p>

                    {/* Preview */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <pre className="text-sm text-[#737373] leading-relaxed whitespace-pre-wrap font-sans">
                          {c.ai_pitch}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky copy bar when a pitch is selected */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
          <div className="max-w-[800px] mx-auto bg-[#141414] border border-white/[0.12] rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-2xl shadow-black/50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#525252]">Selected</p>
              <p className="text-sm font-medium text-white truncate">{selected.name}</p>
            </div>
            <button
              onClick={() => handleCopy(selected.ai_pitch || "")}
              className="flex items-center gap-2 rounded-xl bg-white text-[#080808] px-5 py-2.5 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all flex-shrink-0"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Pitch
                </>
              )}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#525252] hover:text-white transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
