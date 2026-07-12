"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

function formatJobType(t: string) {
  const m: Record<string, string> = {
    DISCOVER: "Discovery", SCRAPE: "Audit", AUDIT: "Audit",
    PITCH: "Pitch", EMAIL: "Email", PROCESS_REPLY: "Reply",
  };
  return m[t] || t;
}

function getStatusStyle(status: string) {
  const m: Record<string, { dot: string; label: string; bg: string; text: string }> = {
    PENDING:            { dot: "bg-yellow-400",  label: "Pending",  bg: "bg-yellow-50",  text: "text-yellow-700" },
    RUNNING:            { dot: "bg-blue-400",    label: "Running",  bg: "bg-blue-50",    text: "text-blue-700" },
    COMPLETED:          { dot: "bg-green-500",   label: "Done",     bg: "bg-green-50",   text: "text-green-700" },
    DONE:               { dot: "bg-green-500",   label: "Done",     bg: "bg-green-50",   text: "text-green-700" },
    FAILED:             { dot: "bg-red-400",     label: "Failed",   bg: "bg-red-50",     text: "text-red-600" },
    FAILED_PERMANENTLY: { dot: "bg-red-500",     label: "Failed",   bg: "bg-red-50",     text: "text-red-600" },
  };
  return m[status] || { dot: "bg-gray-300", label: status, bg: "bg-gray-50", text: "text-gray-600" };
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

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 10);
  const chartH = 140;
  const barW = 32;
  const gap = 16;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalW + 40} ${chartH + 36}`} className="w-full" style={{ maxHeight: 200 }}>
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line x1={30} x2={totalW + 30} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={24} y={y + 4} fontSize="9" fill="#bbb" textAnchor="end">{tick}</text>
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
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={isLatest ? "#111" : "#e5e5e5"} />
            <text x={x + barW / 2} y={chartH + 18} fontSize="10" fill="#aaa" textAnchor="middle">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
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
    { label: "Prospects", value: data?.totalProspects ?? 0, icon: "👥", href: "/dashboard/prospects" },
    { label: "Audits", value: data?.activeAudits ?? 0, icon: "🔍", href: "/dashboard/audits" },
    { label: "Emails", value: data?.emailsSent ?? 0, icon: "✉️", href: "/dashboard/pitches" },
    { label: "Replies", value: data?.replies ?? 0, icon: "💬", href: "/dashboard/inbox" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="font-display text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? (
                <span className="inline-block h-8 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                s.value.toLocaleString()
              )}
            </p>
          </Link>
        ))}
      </div>

      {/* Main grid: Chart + Discover + Pipeline */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mb-6">

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-semibold text-gray-900">Leads Discovered</h2>
            <button onClick={fetchData} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Refresh">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <BarChart data={data?.chartData || []} />
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Discover form */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h2 className="font-display text-sm font-semibold text-gray-900 mb-1">Find Leads</h2>
            <p className="text-xs text-gray-400 mb-4">Enter a niche and location to start.</p>
            <form onSubmit={handleDiscover} className="space-y-2.5">
              <input
                type="text"
                placeholder="Business type (e.g. dentists)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={discovering}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={discovering}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
              />
              {discoverError && <p className="text-xs text-red-500">{discoverError}</p>}
              <button
                type="submit"
                disabled={discovering || !keyword.trim()}
                className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {discovering ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M22 12a10 10 0 0 0-10-10" />
                    </svg>
                    Discovering...
                  </>
                ) : "Start Discovery"}
              </button>
            </form>
          </div>

          {/* Pipeline */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 flex-1">
            <h2 className="font-display text-sm font-semibold text-gray-900 mb-4">Pipeline</h2>
            {[
              { label: "Prospects → Audited", pct: 72 },
              { label: "Audited → Pitched", pct: 54 },
              { label: "Pitched → Replied", pct: 18 },
            ].map(({ label, pct }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/dashboard/prospects" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            View all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 17 17 7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Job", "Target", "Status", "Time"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 bg-gray-100 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.recentJobs?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                    No activity yet. Start a discovery above.
                  </td>
                </tr>
              ) : (
                data.recentJobs.slice(0, 6).map((job) => {
                  const s = getStatusStyle(job.status);
                  return (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">{formatJobType(job.type)}</td>
                      <td className="px-6 py-3.5 text-gray-500 max-w-[200px] truncate">
                        {job.payload?.keyword || job.payload?.target || "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">{timeAgo(job.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
