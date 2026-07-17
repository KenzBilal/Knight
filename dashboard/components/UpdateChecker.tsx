"use client";

import { useEffect, useRef, useState } from "react";

export function UpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [, setNewVersion] = useState<string | null>(null);
  const currentVersionRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (currentVersionRef.current === null) {
          currentVersionRef.current = data.version;
        } else if (data.version !== currentVersionRef.current) {
          setNewVersion(data.version);
          setShowUpdate(true);
        }
      } catch {}
    }

    // Check 2s after mount, then every 15s
    const timer = setTimeout(check, 2000);
    const interval = setInterval(check, 15_000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative rounded-2xl bg-[#0c0c0c] border border-white/[0.06] p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4ade80]/10 border border-[#4ade80]/20 mb-5">
          <svg className="w-7 h-7 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </div>

        <h3 className="text-[18px] font-semibold text-white mb-2">Update Available</h3>
        <p className="text-[13px] text-[#525252] mb-6 leading-relaxed">
          A new version of Knight is ready. Reload to get the latest features and fixes.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowUpdate(false)}
            className="rounded-xl border border-white/[0.08] text-[#a3a3a3] font-medium text-[13px] px-5 py-2.5 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
          >
            Later
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-5 py-2.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-200"
          >
            Reload Now
          </button>
        </div>
      </div>
    </div>
  );
}
