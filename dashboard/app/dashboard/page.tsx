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
      PENDING: "text-yellow-500", RUNNING: "text-neutral-400",
      DONE: "text-green-500", FAILED: "text-red-500",
    };
    return map[status] || "text-neutral-500";
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 animate-pulse">
                <div className="h-3 w-20 bg-neutral-800 rounded mb-2" />
                <div className="h-8 w-12 bg-neutral-800 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 grain-card">
              <p className="text-xs text-neutral-400 mb-1">Prospects</p>
              <p className="text-2xl font-bold text-paper-100">{data?.totalProspects || 0}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 grain-card">
              <p className="text-xs text-neutral-400 mb-1">Audits</p>
              <p className="text-2xl font-bold text-paper-100">{data?.activeAudits || 0}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 grain-card">
              <p className="text-xs text-neutral-400 mb-1">Emails Sent</p>
              <p className="text-2xl font-bold text-paper-100">{data?.emailsSent || 0}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 grain-card">
              <p className="text-xs text-neutral-400 mb-1">Replies</p>
              <p className="text-2xl font-bold text-green-500">{data?.replies || 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 grain-card">
          <h2 className="font-display text-lg text-paper-100 mb-4">Find Leads</h2>
          <form onSubmit={handleDiscover} className="space-y-3">
            <input
              type="text"
              placeholder="Business type (e.g. plumbers, dentists)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all"
            />
            <input
              type="text"
              placeholder="Location (e.g. Austin, NYC)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all"
            />
            <button
              type="submit"
              disabled={discovering}
              className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors disabled:opacity-50"
            >
              {discovering ? "Discovering..." : "Start Discovery"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 grain-card">
          <h2 className="font-display text-lg text-paper-100 mb-4">Recent Activity</h2>
          {!data?.recentJobs?.length ? (
            <p className="text-sm text-neutral-500">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-neutral-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-paper-100">{formatJobType(job.type)}</span>
                    {job.payload?.keyword && (
                      <span className="text-xs text-neutral-500">&quot;{job.payload.keyword}&quot;</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${formatJobStatus(job.status)}`}>{job.status}</span>
                    <span className="text-xs text-neutral-500">
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
