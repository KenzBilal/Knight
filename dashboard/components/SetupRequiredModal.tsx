"use client";

import { useRouter } from "next/navigation";

export function SetupRequiredModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[400px] mx-4 bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#525252]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2
            className="text-[18px] font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Complete Your Setup
          </h2>
          <p className="text-[13px] text-[#525252] leading-relaxed mb-8">
            Please fill in your company details to unlock all features.
            This only takes a minute.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/dashboard/wizard/profile");
              }}
              className="w-full bg-white text-[#080808] rounded-xl py-3 text-[13px] font-bold hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              Complete Company Profile
            </button>
            <button
              onClick={onClose}
              className="w-full text-[#525252] hover:text-[#737373] py-2 text-[12px] font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
