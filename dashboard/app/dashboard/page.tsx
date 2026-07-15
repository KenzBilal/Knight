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
    PENDING:            { dot: "bg-yellow-400",  label: "Pending",  text: "text-yellow-600" },
    RUNNING:            { dot: "bg-blue-400",    label: "Running",  text: "text-blue-600" },
    COMPLETED:          { dot: "bg-green-500",   label: "Done",     text: "text-green-600" },
    DONE:               { dot: "bg-green-500",   label: "Done",     text: "text-green-600" },
    FAILED:             { dot: "bg-red-400",     label: "Failed",   text: "text-red-500" },
    FAILED_PERMANENTLY: { dot: "bg-red-500",     label: "Failed",   text: "text-red-500" },
  };
  return m[status] || { dot: "bg-gray-300", label: status, text: "text-gray-400" };
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
  const max = Math.max(...data.map((d) => d.value), 10);
  const chartH = 160;
  const barW = 36;
  const gap = 20;
  const totalW = data.length * (barW + gap) - gap;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${totalW + 40} ${chartH + 48}`}
      className="w-full"
      style={{ maxHeight: 220 }}
    >
      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line
              x1={30} x2={totalW + 30}
              y1={y} y2={y}
              stroke="#ebebeb" strokeWidth="1"
            />
            <text x={24} y={y + 4} fontSize="9" fill="#bbb" textAnchor="end">
              {tick === 0 ? "0" : `${tick}`}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = 30 + i * (barW + gap);
        const y = chartH - barH;
        const isLatest = i === data.length - 1;
        return (
          <g key={d.month}>
            <rect
              x={x} y={y}
              width={barW} height={barH}
              rx="6" ry="6"
              fill={isLatest ? "#d4d4d4" : "#111"}
            />
            <text
              x={x + barW / 2} y={chartH + 18}
              fontSize="10" fill="#aaa" textAnchor="middle"
              className="font-bold uppercase tracking-wider"
            >
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
  label, value, trend, trendUp, dark = false, href, loading,
}: {
  label: string;
  value: number;
  trend: string;
  trendUp: boolean;
  dark?: boolean;
  href?: string;
  loading: boolean;
}) {
  const card = (
    <div
      className={`rounded-[32px] p-6 cursor-pointer transition-all duration-200 border ${
        dark
          ? "bg-[#111] text-white border-[#222] hover:bg-[#1a1a1a]"
          : "bg-white text-[#111] border-[#f0f0f0] hover:bg-[#fafafa]"
      }`}
      style={!dark ? { boxShadow: '0 4px 16px rgba(0,0,0,0.02)' } : {}}
    >
      <p className={`text-[13px] font-medium mb-3 ${dark ? "text-white/50" : "text-[#999]"}`}>
        {label}
      </p>
      {loading ? (
        <div className={`h-9 w-24 rounded-lg animate-pulse ${dark ? "bg-white/10" : "bg-[#f0f0f0]"}`} />
      ) : (
        <p className={`text-[32px] font-bold mb-3 tracking-tight ${dark ? "text-white" : "text-[#111]"}`}>
          {value.toLocaleString()}
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[6px] ${
          dark ? (trendUp ? "bg-white/10 text-white" : "bg-red-500/20 text-red-300")
               : (trendUp ? "bg-[#111] text-white" : "bg-red-100 text-red-600")
        }`}>
          {trendUp ? "+" : "-"}{trend}
        </span>
        <span className={`text-[11px] font-medium ${dark ? "text-white/30" : "text-[#bbb]"}`}>
          vs last month
        </span>
      </div>
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      await fetchData();
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDiscovering(false);
    }
  }

  const stats = [
    { label: "Total Prospects", value: data?.totalProspects ?? 0, trend: "4.2%", trendUp: true,  dark: true,  href: "/dashboard/prospects" },
    { label: "Audits Run",      value: data?.activeAudits  ?? 0, trend: "1.7%", trendUp: true,  dark: false, href: "/dashboard/audits" },
    { label: "Emails Sent",     value: data?.emailsSent    ?? 0, trend: "2.9%", trendUp: false, dark: false, href: "/dashboard/pitches" },
    { label: "Replies",         value: data?.replies       ?? 0, trend: "0.9%", trendUp: true,  dark: false, href: "/dashboard/inbox" },
  ];

  // Today's date display
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">

      {/* ── Period filter + date ── */}
      <div className="flex justify-between items-center flex-wrap gap-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">Dashboard Overview</h2>
          <span className="text-[12px] font-semibold text-[#999]">
            {today.getDate()} {monthName} {year}
          </span>
        </div>
        <div className="flex items-center bg-white rounded-full p-1 border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                period === p
                  ? "bg-[#111] text-white"
                  : "text-[#999] hover:text-[#111]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Two column: Chart + Right panel ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">

        {/* Bar chart card */}
        <div className="bg-white rounded-[32px] p-8 border border-[#f0f0f0] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">
              Leads Discovered
            </h2>
            <button
              onClick={fetchData}
              className="w-10 h-10 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#111] hover:bg-[#ebebeb] transition-all"
              aria-label="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
          <BarChart data={data?.chartData || []} />
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-6">

          {/* Quick discover form */}
          <div className="bg-white rounded-[32px] p-8 border border-[#f0f0f0] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex-1">
            <h2 className="text-[17px] font-semibold tracking-tight text-[#111] mb-2">
              Find Leads
            </h2>
            <p className="text-[12px] font-medium text-[#aaa] mb-6">
              Enter a niche and location to start discovery.
            </p>
            <form onSubmit={handleDiscover} className="space-y-3">
              <input
                type="text"
                placeholder="Business type (e.g. dentists)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={discovering}
                className="w-full bg-[#f9f9f9] border border-[#f0f0f0] rounded-[16px] px-4 py-3 text-[13px] font-medium text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#111] transition-all"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={discovering}
                className="w-full bg-[#f9f9f9] border border-[#f0f0f0] rounded-[16px] px-4 py-3 text-[13px] font-medium text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#111] transition-all"
              />
              {discoverError && (
                <p className="text-[12px] font-semibold text-red-500 px-1">{discoverError}</p>
              )}
              <button
                type="submit"
                disabled={discovering || !keyword.trim()}
                className="w-full bg-[#111] text-white rounded-[16px] py-3 mt-2 text-[13px] font-semibold hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="bg-[#111] rounded-[32px] p-8 border border-[#222] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <h2 className="text-[17px] font-semibold tracking-tight text-white mb-6">
              Pipeline Health
            </h2>
            {[
              { label: "Prospects → Audited", pct: 72 },
              { label: "Audited → Pitched", pct: 54 },
              { label: "Pitched → Replied", pct: 18 },
            ].map(({ label, pct }) => (
              <div key={label} className="mb-5 last:mb-0">
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-white/60">{label}</span>
                  <span className="text-white">{pct}%</span>
                </div>
                <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
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
          <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">
            Recent Activity
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="w-10 h-10 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center text-[#111] hover:bg-[#fafafa] transition-all"
              aria-label="Refresh activity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <Link
              href="/dashboard/prospects"
              className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-white hover:bg-[#222] transition-all"
              aria-label="View all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M7 17 17 7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-[32px] overflow-hidden border border-[#f0f0f0] shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  {["Job", "Target", "Status", "Time"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#f7f7f7] animate-pulse">
                      {[1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="h-3 bg-[#f0f0f0] rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.recentJobs?.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[13px] font-medium text-[#bbb]">
                      No activity yet. Start a discovery above.
                    </td>
                  </tr>
                ) : (
                  data.recentJobs.slice(0, 8).map((job) => {
                    const s = getStatusStyle(job.status);
                    return (
                      <tr key={job.id} className="border-b border-[#f9f9f9] last:border-0 hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#111]">
                            {formatJobType(job.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#777] font-medium max-w-[200px] truncate">
                          {job.payload?.keyword || job.payload?.target || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                            job.status === "COMPLETED" || job.status === "DONE"
                              ? "bg-[#111] text-white"
                              : job.status === "RUNNING"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : job.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
                              : "bg-red-50 text-red-500 border border-red-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#aaa] font-medium">
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
