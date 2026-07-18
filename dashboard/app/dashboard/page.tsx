"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OverviewData {
  totalProspects: number;
  activeAudits: number;
  emailsSent: number;
  replies: number;
  chartData?: { month: string; value: number }[];
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    created_at: string;
    payload: Record<string, string>;
  }>;
  pipeline?: {
    prospectsToAudited: number;
    auditedToPitched: number;
    pitchedToReplied: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatJobType(t: string) {
  const m: Record<string, string> = {
    DISCOVER: "Discovery", SCRAPE: "Audit", AUDIT: "Audit",
    PITCH: "Pitch", EMAIL: "Email", PROCESS_REPLY: "Reply",
  };
  return m[t] || t;
}

function getStatusStyle(status: string) {
  const m: Record<string, { dot: string; label: string; text: string }> = {
    PENDING:            { dot: "bg-yellow-400",  label: "Pending",  text: "text-yellow-400" },
    RUNNING:            { dot: "bg-blue-400",    label: "Running",  text: "text-blue-400" },
    COMPLETED:          { dot: "bg-green-400",   label: "Done",     text: "text-green-400" },
    DONE:               { dot: "bg-green-400",   label: "Done",     text: "text-green-400" },
    FAILED:             { dot: "bg-red-400",     label: "Failed",   text: "text-red-400" },
    FAILED_PERMANENTLY: { dot: "bg-red-500",     label: "Failed",   text: "text-red-400" },
  };
  return m[status] || { dot: "bg-[#3a3a3a]", label: status, text: "text-[#525252]" };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Bar Chart (pure SVG) ─────────────────────────────────────────────────────
function BarChart({ data }: { data: { month: string; value: number }[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[13px] text-[#525252] font-medium">
        No data yet
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 10);
  const chartH = 160;
  const barW = 36;
  const gap = 20;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg
      viewBox={`0 0 ${totalW + 40} ${chartH + 48}`}
      className="w-full"
      style={{ maxHeight: 220 }}
    >
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line x1={30} x2={totalW + 30} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={24} y={y + 4} fontSize="9" fill="#3a3a3a" textAnchor="end">{tick}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = 30 + i * (barW + gap);
        const y = chartH - barH;
        const isLatest = i === data.length - 1;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" ry="4" fill={isLatest ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"} />
            <text x={x + barW / 2} y={chartH + 18} fontSize="10" fill="#525252" textAnchor="middle" className="uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, href, loading,
}: {
  label: string;
  value: number;
  href?: string;
  loading: boolean;
}) {
  const card = (
    <div className="stat-card dash-card-hover p-6">
      <p className="text-[11px] font-medium text-[#525252] mb-3 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
      {loading ? (
        <div className="h-9 w-24 rounded bg-white/[0.04] animate-pulse" />
      ) : (
        <p className="text-[32px] font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PERIODS = ["Day", "Week", "Month", "Year"] as const;

export default function DashboardPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Month");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(true);

  const fetchData = useCallback(async (p?: string) => {
    try {
      const periodParam = p || "Month";
      const res = await fetch(`/api/overview?period=${periodParam}`);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setNeedsSetup(!d.company_name))
      .catch(() => {});
  }, []);

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setDiscovering(true);
    setDiscoverError("");
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), location: location.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Discovery failed");
      }
      setKeyword("");
      setLocation("");
      await fetchData(period);
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDiscovering(false);
    }
  }

  const stats = [
    { label: "Total Prospects", value: data?.totalProspects ?? 0, href: "/dashboard/prospects" },
    { label: "Audits Run",      value: data?.activeAudits  ?? 0, href: "/dashboard/audits" },
    { label: "Emails Sent",     value: data?.emailsSent    ?? 0, href: "/dashboard/pitches" },
    { label: "Replies",         value: data?.replies       ?? 0, href: "/dashboard/inbox" },
  ];

  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">

      {/* ── Period filter + date ── */}
      <div className="flex justify-between items-center flex-wrap gap-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>Dashboard Overview</h2>
          <span className="text-[12px] font-medium text-[#525252]" style={{ fontFamily: "var(--font-mono)" }}>
            {today.getDate()} {monthName} {year}
          </span>
        </div>
        <div className="flex items-center dash-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${
                period === p
                  ? "bg-white text-[#080808]"
                  : "text-[#525252] hover:text-[#a3a3a3]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Two column: Chart + Right panel ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">

        {/* Bar chart card */}
        <div className="dash-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              Leads Discovered
            </h2>
            <button
              onClick={() => fetchData(period)}
              className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#525252] hover:text-white hover:bg-white/[0.08] transition-all dash-card-glow"
              aria-label="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
          <BarChart data={data?.chartData || []} />
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-6">

          {/* Quick discover form */}
          <div className={`dash-card p-8 flex-1 ${needsSetup ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-[17px] font-semibold tracking-tight text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Find Leads
            </h2>
            <p className="text-[12px] font-medium text-[#525252] mb-6">
              {needsSetup ? "Complete your company profile to enable discovery." : "Enter a niche and location to start discovery."}
            </p>
            <form onSubmit={handleDiscover} className="space-y-3">
              <input
                type="text"
                placeholder="Business type (e.g. dentists)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={discovering}
                className="w-full input-base px-4 py-3 text-[13px]"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={discovering}
                className="w-full input-base px-4 py-3 text-[13px]"
              />
              {discoverError && (
                <p className="text-[12px] font-semibold text-[#f87171] px-1">{discoverError}</p>
              )}
              <button
                type="submit"
                disabled={discovering || !keyword.trim()}
                className="w-full bg-white text-[#080808] rounded-lg py-3 mt-2 text-[13px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {discovering ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M22 12a10 10 0 0 0-10-10"/>
                    </svg>
                    Discovering...
                  </>
                ) : "Start Discovery"}
              </button>
            </form>
          </div>

          {/* Pipeline health */}
        <div className="dash-card p-8">
            <h2 className="text-[17px] font-semibold tracking-tight text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Pipeline Health
            </h2>
            {[
              { label: "Prospects → Audited", pct: data?.pipeline?.prospectsToAudited ?? 0 },
              { label: "Audited → Pitched", pct: data?.pipeline?.auditedToPitched ?? 0 },
              { label: "Pitched → Replied", pct: data?.pipeline?.pitchedToReplied ?? 0 },
            ].map(({ label, pct }) => (
              <div key={label} className="mb-5 last:mb-0">
                <div className="flex justify-between text-[11px] font-medium mb-2">
                  <span className="text-[#525252]">{label}</span>
                  <span className="text-[#a3a3a3]">{pct}%</span>
                </div>
                <div className="h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/20 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity table ── */}
      <div>
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-[17px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            Recent Activity
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(period)}
              className="w-10 h-10 rounded-lg dash-card flex items-center justify-center text-[#525252] hover:text-white hover:bg-white/[0.06] transition-all"
              aria-label="Refresh activity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <Link
              href="/dashboard/prospects"
              className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-white hover:bg-white/[0.12] transition-all dash-card-glow"
              aria-label="View all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17 17 7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="dash-card p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Job", "Target", "Status", "Time"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-[11px] font-medium text-[#525252] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04] animate-pulse">
                      {[1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.recentJobs?.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[13px] font-medium text-[#3a3a3a]">
                      No activity yet. Start a discovery above.
                    </td>
                  </tr>
                ) : (
                  data.recentJobs.slice(0, 8).map((job) => {
                    const s = getStatusStyle(job.status);
                    return (
                      <tr key={job.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">
                            {formatJobType(job.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#525252] font-medium max-w-[200px] truncate">
                          {job.payload?.keyword || job.payload?.target || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium ${
                            job.status === "COMPLETED" || job.status === "DONE"
                              ? "bg-white/[0.08] text-white"
                              : job.status === "RUNNING"
                              ? "bg-[#60a5fa]/10 text-[#60a5fa]"
                              : job.status === "PENDING"
                              ? "bg-[#facc15]/10 text-[#facc15]"
                              : "bg-[#f87171]/10 text-[#f87171]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#3a3a3a] font-medium">
                          {timeAgo(job.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
