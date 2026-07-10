"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-paper-100 mb-3">Payment successful!</h1>
        <p className="text-paper-400 mb-8">Your plan is now active. Start finding leads with your AI sales rep.</p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-flash-500 text-ink-950 font-medium px-6 py-3 text-sm hover:bg-flash-400 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
