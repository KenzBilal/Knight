"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OverviewData {
  totalProspects: number;
  activeAudits: number;
  emailsSent: number;
  replies: number;
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    created_at: string;
    payload: Record<string, unknown>;
  }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatJobType(type: string) {
  const map: Record<string, string> = {
    DISCOVER: "Discovery",
    SCRAPE: "Audit",
    AUDIT: "Audit",
    PITCH: "Pitch",
    EMAIL: "Email",
    PROCESS_REPLY: "Reply",
  };
  return map[type] || type;
}

// Bug fix: worker sets COMPLETED, old code checked for DONE
function getStatusStyle(status: string): { dot: string; text: string; label: string } {
  const map: Record<string, { dot: string; text: string; label: string }> = {
    PENDING:            { dot: "bg-[#facc15]", text: "text-[#facc15]", label: "Pending" },
    RUNNING:            { dot: "bg-[#60a5fa] animate-pulse", text: "text-[#60a5fa]", label: "Running" },
    COMPLETED:          { dot: "bg-[#4ade80]", text: "text-[#4ade80]", label: "Done" },
    DONE:               { dot: "bg-[#4ade80]", text: "text-[#4ade80]", label: "Done" }, // legacy
    FAILED:             { dot: "bg-[#f87171]", text: "text-[#f87171]", label: "Failed" },
    FAILED_PERMANENTLY: { dot: "bg-[#f87171]", text: "text-[#f87171]", label: "Failed" },
  };
  return map[status] || { dot: "bg-[#3a3a3a]", text: "text-[#525252]", label: status };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  loading,
  href,
}: {
  label: string;
  value: number;
  loading: boolean;
  href?: string;
}) {
  const content = (
    <div className="card p-5 hover:border-white/[0.1] transition-colors">
      <p className="text-xs text-[#3a3a3a] mb-3 font-mono uppercase tracking-wider">
        {label}
      </p>
      {loading ? (
        <div className="h-8 w-16 bg-white/[0.04] rounded animate-pulse" />
      ) : (
        <p className="font-display text-3xl font-700 text-white">{value.toLocaleString()}</p>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardOverviewPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setData(d);
    } catch {
      // silently fail — data stays null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        throw new Error(err.error || "Discovery failed");
      }
      await fetchData();
    } catch (err: unknown) {
      setDiscoverError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDiscovering(false);
    }
  }

  const stats = [
    { label: "Total Prospects", value: data?.totalProspects ?? 0, href: "/dashboard/prospects" },
    { label: "Audits Run", value: data?.activeAudits ?? 0, href: "/dashboard/audits" },
    { label: "Emails Sent", value: data?.emailsSent ?? 0, href: "/dashboard/pitches" },
    { label: "Replies", value: data?.replies ?? 0, href: "/dashboard/inbox" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            loading={loading}
            href={s.href}
          />
        ))}
      </div>

      {/* Main two-column */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Discovery form */}
        <div className="card p-6">
          <h2 className="font-display text-base font-600 text-white mb-1">
            Find leads
          </h2>
          <p className="text-xs text-[#3a3a3a] mb-5">
            Enter a business type and location. Knight will discover and audit matching sites.
          </p>

          <form onSubmit={handleDiscover} className="space-y-3">
            <input
              type="text"
              id="discover-keyword"
              placeholder="Business type — e.g. dentists, plumbers"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input-base"
              required
              disabled={discovering}
            />
            <input
              type="text"
              id="discover-location"
              placeholder="Location — e.g. Austin TX, NYC"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-base"
              disabled={discovering}
            />

            {discoverError && (
              <p className="text-xs text-[#f87171]">{discoverError}</p>
            )}

            <button
              type="submit"
              disabled={discovering || !keyword.trim()}
              className="btn-primary w-full"
            >
              {discovering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M22 12a10 10 0 0 0-10-10"/>
                  </svg>
                  Discovering...
                </span>
              ) : (
                "Start discovery"
              )}
            </button>
          </form>
        </div>

        {/* Recent activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-600 text-white">
              Recent activity
            </h2>
            {data?.recentJobs && data.recentJobs.length > 0 && (
              <Link
                href="/dashboard/prospects"
                className="text-xs text-[#3a3a3a] hover:text-[#a3a3a3] transition-colors"
              >
                View all
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="h-3 w-24 bg-white/[0.04] rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/[0.04] rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !data?.recentJobs?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#3a3a3a]">No activity yet.</p>
              <p className="text-xs text-[#2a2a2a] mt-1">
                Start a discovery to see jobs here.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {data.recentJobs.slice(0, 6).map((job) => {
                const status = getStatusStyle(job.status);
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                      <div className="min-w-0">
                        <span className="text-sm text-[#a3a3a3] block truncate">
                          {formatJobType(job.type)}
                        </span>
                        {typeof job.payload?.keyword === 'string' && (
                          <span className="text-xs text-[#3a3a3a] truncate block">
                            {job.payload.keyword}
                          </span>
                        )}
                        {typeof job.payload?.target === 'string' && (
                          <span className="text-xs text-[#3a3a3a] truncate block">
                            {job.payload.target}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-3">
                      <span className={`text-xs font-mono ${status.text}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] text-[#2a2a2a]">
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
