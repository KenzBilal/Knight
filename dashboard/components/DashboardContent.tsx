"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/DashboardShell";

const pageTitles: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/prospects":  "Prospects",
  "/dashboard/inbox":      "Inbox",
  "/dashboard/audits":     "Audits",
  "/dashboard/pitches":    "Pitches",
  "/dashboard/telegram":   "Telegram",
  "/dashboard/settings":   "Settings",
  "/dashboard/billing":    "Billing",
  "/dashboard/support":    "Support",
  "/dashboard/wizard":     "Setup",
};

export function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [unseenCount, setUnseenCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [checkedUnseen, setCheckedUnseen] = useState(false);

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles)
      .filter(([key]) => pathname.startsWith(key) && key !== "/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    "Dashboard";

  // Check unseen support replies on load
  useEffect(() => {
    if (checkedUnseen) return;
    fetch("/api/support/unseen")
      .then((r) => r.json())
      .then((d) => {
        const count = d.unseenCount || 0;
        setUnseenCount(count);
        if (count > 0) setShowPopup(true);
        setCheckedUnseen(true);
      })
      .catch(() => setCheckedUnseen(true));
  }, [checkedUnseen]);

  function dismissPopup() {
    setShowPopup(false);
  }

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      {/* Unseen reply notification popup */}
      {showPopup && unseenCount > 0 && (
        <div className="mx-8 mt-6 dash-card px-6 py-5 flex items-center gap-4 absolute top-0 right-0 z-50">
          <div className="w-12 h-12 rounded-full bg-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-[14px] font-bold text-white">
              You have {unseenCount} new support {unseenCount === 1 ? "reply" : "replies"}
            </p>
            <p className="text-[12px] font-medium text-[#525252] mt-0.5">Check your support tickets for updates</p>
          </div>
          <Link
            href="/dashboard/support"
            onClick={() => setShowPopup(false)}
            className="bg-white text-[#080808] rounded-lg px-6 py-2.5 text-[13px] font-bold hover:bg-white/90 transition-colors"
          >
            View
          </Link>
          <button
            onClick={dismissPopup}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#525252] hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Top bar */}
      <header className="h-[70px] md:h-[90px] flex items-center px-4 md:px-8 gap-4 md:gap-6 flex-shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-all -ml-1"
          aria-label="Toggle menu"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
        </button>

        {/* Page title */}
        <h1 className="text-lg md:text-[22px] font-bold text-white flex-1 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>

        {/* Support/Notification icon */}
        <Link
          href="/dashboard/support"
          className="relative w-[42px] h-[42px] rounded-lg flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-all dash-card-glow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#f87171] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Link>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto px-2">
        {children}
      </div>
    </main>
  );
}
