"use client";

import { useState, useEffect } from "react";
import { HelpModal } from "@/components/HelpModal";

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
  const [domain, setDomain] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
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
      // Refresh data
      const res = await fetch("/api/overview");
      setData(await res.json());
    } catch {}
    setDiscovering(false);
  }

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain) return;
    setAuditing(true);
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: domain }),
      });
      // Refresh data
      const res = await fetch("/api/overview");
      setData(await res.json());
    } catch {}
    setAuditing(false);
  }

  function formatJobType(type: string) {
    switch (type) {
      case "DISCOVER": return "Lead Discovery";
      case "SCRAPE": return "Website Scrape";
      case "AUDIT": return "Website Audit";
      case "PITCH": return "AI Pitch";
      case "EMAIL": return "Email Sent";
      default: return type;
    }
  }

  function formatJobStatus(status: string) {
    switch (status) {
      case "PENDING": return "text-yellow-500";
      case "RUNNING": return "text-flash-500";
      case "DONE": return "text-green-500";
      case "FAILED": return "text-danger-500";
      default: return "text-paper-400";
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Dashboard</h1>
        <HelpModal title="Dashboard">
          <p>The Dashboard gives you an overview of your Knight account and quick access to core features.</p>
          <p><strong>Stats:</strong> View your total prospects, active audits, emails sent, and replies at a glance.</p>
          <p><strong>Auto-discover leads:</strong> Enter your niche and location to find businesses that need your services.</p>
          <p><strong>Audit a website:</strong> Run a 30+ point audit on any website to identify issues and generate pitches.</p>
          <p><strong>Recent activity:</strong> See the latest actions taken by Knight across all your campaigns.</p>
        </HelpModal>
      </div>

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
              <p className="text-xs text-paper-400 mb-1">Total Prospects</p>
              <p className="text-2xl font-bold text-paper-100">{data?.totalProspects || 0}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-5">
              <p className="text-xs text-paper-400 mb-1">Active Audits</p>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Discovery */}
        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100 mb-4">Auto-discover leads</h2>
          <form onSubmit={handleDiscover} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. plumbers, restaurants, dentists"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <input
              type="text"
              placeholder="e.g. Austin, New York, London"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <button
              type="submit"
              disabled={discovering}
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
            >
              {discovering ? "Discovering..." : "Start discovery"}
            </button>
          </form>
        </div>

        {/* Single audit */}
        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100 mb-4">Audit a single website</h2>
          <form onSubmit={handleAudit} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <button
              type="submit"
              disabled={auditing}
              className="rounded-lg bg-ink-800 text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-700 border border-line transition-colors disabled:opacity-50"
            >
              {auditing ? "Auditing..." : "Run audit"}
            </button>
          </form>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8 rounded-xl border border-line bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100 mb-4">Recent activity</h2>
        {!data?.recentJobs?.length ? (
          <p className="text-sm text-paper-400">No recent activity. Start a discovery or audit to see results here.</p>
        ) : (
          <div className="space-y-2">
            {data.recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-line/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-paper-100">{formatJobType(job.type)}</span>
                  {job.payload?.keyword && (
                    <span className="text-xs text-paper-400">&quot;{job.payload.keyword}&quot;</span>
                  )}
                  {job.payload?.url && (
                    <span className="text-xs text-paper-400">{job.payload.url}</span>
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
  );
}
