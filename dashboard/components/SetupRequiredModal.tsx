"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export function SetupRequiredModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="p-10 text-center">
          {/* Icon */}
          <div className="w-[72px] h-[72px] rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-7">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#404040]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2
            className="text-[20px] font-bold text-white mb-2.5 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Complete Your Setup
          </h2>
          <p className="text-[14px] text-[#525252] leading-relaxed mb-8 max-w-[320px] mx-auto">
            Fill in your company details to unlock all dashboard features and enable the AI agent.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/dashboard/wizard/profile");
              }}
              className="w-full bg-white text-[#080808] rounded-xl py-3.5 text-[14px] font-bold hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
            >
              Complete Company Profile
            </button>
            <button
              onClick={onClose}
              className="w-full text-[#525252] hover:text-[#737373] py-2.5 text-[13px] font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
