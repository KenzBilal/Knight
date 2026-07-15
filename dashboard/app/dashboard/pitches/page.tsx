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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PITCHED: "bg-[#60a5fa]/10 text-[#60a5fa]",
    REPLIED: "bg-[#4ade80]/10 text-[#4ade80]",
    REJECTED: "bg-[#f87171]/10 text-[#f87171]",
    NEW: "bg-white/[0.06] text-[#525252]",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.NEW}`}>
      {status}
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
          AI-Generated Pitches
        </h1>
        <p className="text-xs text-[#525252] mt-1">
          {companies.length} pitches generated · Click to preview and copy
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-card p-5 animate-pulse">
              <div className="h-4 w-32 bg-white/[0.04] rounded mb-3" />
              <div className="h-3 w-48 bg-white/[0.04] rounded mb-2" />
              <div className="h-16 bg-white/[0.02] rounded mt-3" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">No pitches yet</p>
          <p className="text-xs text-[#525252]">Pitches are generated automatically after audits complete.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`dash-card p-5 text-left transition-all duration-150 ${
                selected?.id === c.id ? "ring-1 ring-white/20 bg-white/[0.04]" : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-[#a3a3a3]">{c.name?.[0]}</span>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">{c.name}</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-[11px] text-[#525252] truncate mb-2">{c.industry} · {c.website_url}</p>
              <p className="text-xs text-[#3a3a3a] line-clamp-2 leading-relaxed">{c.ai_pitch?.slice(0, 120)}...</p>
              <p className="text-[10px] text-[#3a3a3a] mt-2">{timeAgo(c.created_at)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0a0a0a] border border-white/[0.09] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-semibold text-white">{selected.name}</h2>
                <p className="text-[11px] text-[#525252]">{selected.industry} · {selected.website_url}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#525252] hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium text-[#525252] uppercase tracking-wider">Generated Pitch</span>
                <span className="text-[10px] text-[#3a3a3a]" style={{ fontFamily: "var(--font-mono)" }}>
                  Score: {selected.lead_score}
                </span>
              </div>
              <pre className="text-sm text-[#a3a3a3] leading-relaxed whitespace-pre-wrap font-sans">
                {selected.ai_pitch}
              </pre>
            </div>
            <div className="p-5 border-t border-white/[0.06] flex gap-3">
              <button
                onClick={() => handleCopy(selected.ai_pitch || "")}
                className="flex-1 rounded-lg bg-white text-[#080808] py-2.5 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                {copied ? "Copied!" : "Copy Pitch"}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-5 rounded-lg bg-white/[0.06] text-[#a3a3a3] py-2.5 text-sm font-medium hover:bg-white/[0.1] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
