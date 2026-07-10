"use client";

import { useState } from "react";

export default function DashboardOverviewPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [auditing, setAuditing] = useState(false);

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
    } catch {}
    setAuditing(false);
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Prospects", value: "—" },
          { label: "Active Audits", value: "—" },
          { label: "Pitches Sent", value: "—" },
          { label: "Replies", value: "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-ink-900 p-5">
            <p className="text-xs text-paper-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-paper-100">{s.value}</p>
          </div>
        ))}
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

      {/* Job feed placeholder */}
      <div className="mt-8 rounded-xl border border-line bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100 mb-4">Recent activity</h2>
        <p className="text-sm text-paper-400">No recent activity. Start a discovery or audit to see results here.</p>
      </div>
    </div>
  );
}
