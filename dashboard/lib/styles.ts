// ─── Shared Dashboard Styles ─────────────────────────────────────────────────
// Single source of truth for all dashboard UI patterns.
// Import these constants to keep every page visually consistent.

export const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)" as const;
export const CARD_SHADOW_MD = "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" as const;

export const INPUT =
  "w-full rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] px-4 py-2.5 text-sm text-[#111] placeholder:text-[#aaa] focus:outline-none focus:border-[#999] focus:bg-white transition-all";
export const TEXTAREA =
  "w-full rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] px-4 py-3 text-sm text-[#111] placeholder:text-[#aaa] focus:outline-none focus:border-[#999] focus:bg-white transition-all resize-none";
export const SELECT =
  "rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] px-4 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#999] transition-all appearance-none cursor-pointer";

export const LABEL = "block text-xs font-medium text-[#666] mb-1.5";

export const BTN_PRIMARY =
  "rounded-xl bg-[#111] text-white font-medium px-5 py-2.5 text-sm hover:bg-[#222] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] inline-flex items-center justify-center gap-2";
export const BTN_SECONDARY =
  "rounded-xl border border-[#e5e5e5] text-[#555] font-medium px-4 py-2.5 text-sm hover:bg-[#f5f5f5] hover:text-[#111] transition-all inline-flex items-center justify-center gap-2";
export const BTN_GHOST =
  "text-[#999] hover:text-[#111] transition-colors text-sm font-medium inline-flex items-center gap-1";

export const BADGE_BASE = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold";
export const BADGE_GREEN = `${BADGE_BASE} bg-green-50 text-green-600`;
export const BADGE_RED = `${BADGE_BASE} bg-red-50 text-red-500`;
export const BADGE_YELLOW = `${BADGE_BASE} bg-amber-50 text-amber-600`;
export const BADGE_BLUE = `${BADGE_BASE} bg-blue-50 text-blue-600`;
export const BADGE_GRAY = `${BADGE_BASE} bg-[#f0f0f0] text-[#888]`;

export const EMPTY_STATE_ICON = "w-14 h-14 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4";
