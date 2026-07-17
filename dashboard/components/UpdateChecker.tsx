"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function UpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);
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

    const timer = setTimeout(check, 2000);
    const interval = setInterval(check, 15_000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!showUpdate || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[1px] bg-gradient-to-r from-transparent via-[#4ade80]/20 to-transparent" />

        <div className="p-10 text-center">
          {/* Icon */}
          <div className="w-[72px] h-[72px] rounded-2xl bg-[#4ade80]/[0.06] border border-[#4ade80]/[0.12] flex items-center justify-center mx-auto mb-7">
            <svg className="w-[32px] h-[32px] text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </div>

          <h3
            className="text-[20px] font-bold text-white mb-2.5 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Update Available
          </h3>
          {newVersion && (
            <p className="text-[11px] text-[#3a3a3a] font-medium uppercase tracking-widest mb-2">
              v{newVersion}
            </p>
          )}
          <p className="text-[14px] text-[#525252] mb-8 max-w-[320px] mx-auto leading-relaxed">
            A new version of Knight is ready with the latest features and improvements.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowUpdate(false)}
              className="rounded-xl border border-white/[0.08] text-[#a3a3a3] font-medium text-[13px] px-6 py-3 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
            >
              Later
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-6 py-3 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-200"
            >
              Reload Now
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
