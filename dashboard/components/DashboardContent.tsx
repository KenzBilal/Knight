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
    <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden bg-[#f5f5f5]">
      {/* Unseen reply notification popup */}
      {showPopup && unseenCount > 0 && (
        <div className="mx-6 mt-4 bg-white border border-[#ebebeb] rounded-2xl px-5 py-4 flex items-center gap-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111]">
              You have {unseenCount} new support {unseenCount === 1 ? "reply" : "replies"}
            </p>
            <p className="text-xs text-[#aaa] mt-0.5">Check your support tickets for updates</p>
          </div>
          <Link
            href="/dashboard/support"
            onClick={() => setShowPopup(false)}
            className="bg-[#111] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#222] transition-colors flex-shrink-0"
          >
            View
          </Link>
          <button
            onClick={dismissPopup}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#aaa] hover:text-[#333] hover:bg-[#f0f0f0] transition-all flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Top bar */}
      <header className="h-[70px] bg-white border-b border-[#f0f0f0] flex items-center px-6 gap-4 flex-shrink-0">
        {/* Page title */}
        <h1 className="font-display text-2xl font-bold text-[#111] flex-1 tracking-tight">
          {title}
        </h1>

        {/* Search */}
        <div className="relative hidden md:block">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-52 bg-[#f5f5f5] border border-[#ebebeb] rounded-full pl-9 pr-4 py-2 text-sm text-[#333] placeholder:text-[#aaa] focus:outline-none focus:border-[#ccc] focus:bg-white transition-all"
          />
        </div>

        {/* Support icon */}
        <Link
          href="/dashboard/support"
          className="relative w-9 h-9 rounded-xl border border-[#ebebeb] flex items-center justify-center text-[#666] hover:text-[#111] hover:bg-[#f5f5f5] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0 cursor-pointer">
          <span className="text-[11px] font-bold text-white">{initials}</span>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </main>
  );
}
