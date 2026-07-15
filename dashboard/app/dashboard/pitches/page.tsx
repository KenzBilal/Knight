"use client";

import Link from "next/link";

export default function PitchesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="dash-card p-12 text-center">
        <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-white mb-1">No pitches yet</p>
        <p className="text-xs text-[#525252] mb-5">Pitches are generated automatically after audits complete.</p>
        <Link
          href="/dashboard/prospects"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#080808] px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          View Prospects
        </Link>
      </div>
    </div>
  );
}
