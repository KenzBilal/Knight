"use client";

import Link from "next/link";

export default function AuditsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="dash-card p-12 text-center">
        <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-white mb-1">No audits yet</p>
        <p className="text-xs text-[#525252] mb-5">Run a discovery to generate website audits for prospects.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-[#080808] px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Start Discovery
        </Link>
      </div>
    </div>
  );
}
