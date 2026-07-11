"use client";

import { useState, useEffect } from "react";

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
    payload: any;
  }>;
}

export default function DashboardOverviewPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword) return;
    setDiscovering(true);
    try {
      await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location }),
      });
      const res = await fetch("/api/overview");
      setData(await res.json());
    } catch {}
    setDiscovering(false);
  }

  function formatJobType(type: string) {
    const map: Record<string, string> = {
      DISCOVER: "Discovery", SCRAPE: "Scrape", AUDIT: "Audit",
      PITCH: "Pitch", EMAIL: "Email",
    };
    return map[type] || type;
  }

  function formatJobStatus(status: string) {
    const map: Record<string, string> = {
      PENDING: "text-yellow-500", RUNNING: "text-flash-500",
      DONE: "text-green-500", FAILED: "text-danger-500",
    };
    return map[status] || "text-paper-400";
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border border-line bg-ink-900 p-5 animate-pulse">
                <div className="h-3 w-20 bg-ink-800 rounded mb-2" />
                <div className="h-8 w-12 bg-ink-800 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="rounded-xl border border-line bg-ink-900 p-5">
              <p className="text-xs text-paper-400 mb-1">Prospects</p>
              <p className="text-2xl font-bold text-paper-100">{data?.totalProspects || 0}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-5">
              <p className="text-xs text-paper-400 mb-1">Audits</p>
              <p className="text-2xl font-bold text-flash-500">{data?.activeAudits || 0}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-5">
              <p className="text-xs text-paper-400 mb-1">Emails Sent</p>
              <p className="text-2xl font-bold text-paper-100">{data?.emailsSent || 0}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-5">
              <p className="text-xs text-paper-400 mb-1">Replies</p>
              <p className="text-2xl font-bold text-green-500">{data?.replies || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100 mb-4">Find Leads</h2>
          <form onSubmit={handleDiscover} className="space-y-3">
            <input
              type="text"
              placeholder="Business type (e.g. plumbers, dentists)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <input
              type="text"
              placeholder="Location (e.g. Austin, NYC)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <button
              type="submit"
              disabled={discovering}
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
            >
              {discovering ? "Discovering..." : "Start Discovery"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100 mb-4">Recent Activity</h2>
          {!data?.recentJobs?.length ? (
            <p className="text-sm text-paper-400">No activity yet. Start a discovery to see results.</p>
          ) : (
            <div className="space-y-2">
              {data.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-line/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-paper-100">{formatJobType(job.type)}</span>
                    {job.payload?.keyword && (
                      <span className="text-xs text-paper-400">&quot;{job.payload.keyword}&quot;</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${formatJobStatus(job.status)}`}>{job.status}</span>
                    <span className="text-xs text-paper-400">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
