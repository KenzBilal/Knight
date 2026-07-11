"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-paper-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-paper-100 mb-3">Payment successful</h1>
        <p className="text-neutral-400 mb-8">Your plan is active. Start finding leads with your AI sales rep.</p>
        <Link href="/dashboard" className="inline-block rounded-lg bg-paper-100 text-neutral-950 font-medium px-6 py-3 text-sm hover:bg-paper-200 transition-all active:scale-[0.98]">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
