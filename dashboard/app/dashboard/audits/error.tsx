"use client";

export default function AuditsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="dash-card p-12 text-center">
        <p className="text-sm font-medium text-[#f87171] mb-1">Something went wrong</p>
        <p className="text-xs text-[#525252] mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-1.5 text-[12px] font-medium bg-white/[0.06] text-white rounded-lg hover:bg-white/[0.1] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
