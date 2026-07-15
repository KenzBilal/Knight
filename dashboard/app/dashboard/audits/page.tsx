"use client";

import { useState, useEffect } from "react";

interface AuditResult {
  id: string;
  category: string;
  raw_data: Record<string, unknown>;
  issues_found: Array<{ issue: string; severity: string; detail: string }>;
}

interface Audit {
  id: string;
  company_id: string;
  status: string;
  total_score: number;
  created_at: string;
  companies: { id: string; name: string; website_url: string; industry: string } | null;
  results: AuditResult[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>{score}</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    high: "bg-[#f87171]/10 text-[#f87171]",
    medium: "bg-[#facc15]/10 text-[#facc15]",
    low: "bg-[#60a5fa]/10 text-[#60a5fa]",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${styles[severity] || "bg-white/[0.06] text-[#525252]"}`}>
      {severity}
    </span>
  );
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audits")
      .then((r) => r.json())
      .then((d) => { setAudits(d.audits || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalIssues = audits.reduce((sum, a) => sum + a.results.reduce((s, r) => s + (r.issues_found?.length || 0), 0), 0);
  const avgScore = audits.length ? Math.round(audits.reduce((s, a) => s + (a.total_score || 0), 0) / audits.length) : 0;

  return (
    <div className="p-6 md:p-8">
      {/* Header stats */}
      <div className="flex items-center gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Website Audits
          </h1>
          <p className="text-xs text-[#525252] mt-1">
            {audits.length} audits · {totalIssues} issues found · {avgScore} avg score
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/[0.04]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-white/[0.04] rounded" />
                  <div className="h-3 w-24 bg-white/[0.04] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : audits.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">No audits yet</p>
          <p className="text-xs text-[#525252]">Run a discovery to generate website audits for prospects.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => {
            const company = audit.companies;
            const isExpanded = expanded === audit.id;
            const highIssues = audit.results.reduce((s, r) => s + (r.issues_found?.filter(i => i.severity === "high").length || 0), 0);
            const medIssues = audit.results.reduce((s, r) => s + (r.issues_found?.filter(i => i.severity === "medium").length || 0), 0);
            const lowIssues = audit.results.reduce((s, r) => s + (r.issues_found?.filter(i => i.severity === "low").length || 0), 0);

            return (
              <div key={audit.id} className="dash-card overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : audit.id)}
                  className="w-full p-5 flex items-center gap-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <ScoreRing score={audit.total_score || 0} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{company?.name || "Unknown"}</span>
                      <span className="text-[10px] text-[#3a3a3a]">{company?.industry}</span>
                    </div>
                    <p className="text-xs text-[#525252] mt-0.5">{company?.website_url}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {highIssues > 0 && <span className="text-[10px] font-medium text-[#f87171]">{highIssues} high</span>}
                      {medIssues > 0 && <span className="text-[10px] font-medium text-[#facc15]">{medIssues} medium</span>}
                      {lowIssues > 0 && <span className="text-[10px] font-medium text-[#60a5fa]">{lowIssues} low</span>}
                      {!highIssues && !medIssues && !lowIssues && <span className="text-[10px] text-[#3a3a3a]">No issues</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#3a3a3a] flex-shrink-0">{timeAgo(audit.created_at)}</span>
                  <svg className={`w-4 h-4 text-[#3a3a3a] transition-transform ${isExpanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Expanded results */}
                {isExpanded && audit.results.length > 0 && (
                  <div className="border-t border-white/[0.06] px-5 py-4 space-y-3">
                    {audit.results.map((result) => (
                      <div key={result.id} className="bg-[#0a0a0a] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-white">{result.category}</span>
                          <span className="text-[10px] text-[#3a3a3a]" style={{ fontFamily: "var(--font-mono)" }}>
                            Score: {String(result.raw_data?.score ?? "—")}
                          </span>
                        </div>
                        {result.issues_found && result.issues_found.length > 0 ? (
                          <div className="space-y-1.5">
                            {result.issues_found.map((issue, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <SeverityBadge severity={issue.severity} />
                                <div>
                                  <p className="text-xs text-[#a3a3a3]">{issue.issue}</p>
                                  <p className="text-[10px] text-[#525252]">{issue.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#3a3a3a]">No issues found</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
