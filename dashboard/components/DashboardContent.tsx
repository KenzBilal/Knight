"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

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
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const [unseenCount, setUnseenCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [checkedUnseen, setCheckedUnseen] = useState(false);

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles)
      .filter(([key]) => pathname.startsWith(key) && key !== "/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    "Dashboard";

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : "K";

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

  // Dismiss popup
  function dismissPopup() {
    setShowPopup(false);
  }

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-transparent">
      {/* Unseen reply notification popup */}
      {showPopup && unseenCount > 0 && (
        <div className="mx-8 mt-6 bg-white border border-[#f0f0f0] rounded-[24px] px-6 py-5 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] absolute top-0 right-0 z-50">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-[14px] font-bold text-[#111]">
              You have {unseenCount} new support {unseenCount === 1 ? "reply" : "replies"}
            </p>
            <p className="text-[12px] font-medium text-[#aaa] mt-0.5">Check your support tickets for updates</p>
          </div>
          <Link
            href="/dashboard/support"
            onClick={() => setShowPopup(false)}
            className="bg-[#111] text-white rounded-full px-6 py-2.5 text-[13px] font-bold hover:bg-[#222] transition-colors shadow-md"
          >
            View
          </Link>
          <button
            onClick={dismissPopup}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#aaa] hover:text-[#333] hover:bg-[#f5f5f5] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Top bar */}
      <header className="h-[90px] bg-transparent flex items-center px-8 gap-6 flex-shrink-0">
        {/* Page title */}
        <h1 className="text-[22px] font-bold text-[#111] flex-1 tracking-tight">
          {title}
        </h1>

        {/* Search - Circle icon button instead of long input to match mockup */}
        <button className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-[#111] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:scale-105 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Support/Notification icon */}
        <Link
          href="/dashboard/support"
          className="relative w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-[#111] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:scale-105 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Link>
        
        {/* Create button */}
        <button className="h-[42px] px-6 bg-[#111] text-white rounded-full flex items-center gap-2 text-[13px] font-bold shadow-md hover:bg-[#222] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create
        </button>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto px-2">
        {children}
      </div>
    </main>
  );
}
