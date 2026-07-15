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

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  Plus: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Bell: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
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

  const title =
    pathname === "/dashboard" 
      ? `Hi, ${userName ? userName.split(" ")[0] : "there"}!`
      : pageTitles[pathname] || "Dashboard";

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : "K";

  // Check unseen support replies
  useEffect(() => {
    fetch("/api/support/unseen")
      .then((r) => r.json())
      .then((d) => setUnseenCount(d.unseenCount || 0))
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-[#fafafa]/50 rounded-r-[32px] sm:rounded-r-[40px]">
      
      {/* Top Header */}
      <header className="h-[90px] flex items-center px-8 lg:px-10 justify-between shrink-0">
        
        {/* Title */}
        <h1 className="text-[28px] font-bold text-[#111] tracking-tight">
          {title}
        </h1>

        {/* Right Actions Cluster */}
        <div className="flex items-center gap-4">
          
          {/* Create Button */}
          <Link 
            href="/dashboard/prospects" 
            className="hidden sm:flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#222] transition-colors shadow-sm"
          >
            <Icons.Plus />
            Create
          </Link>

          {/* Search */}
          <button className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <Icons.Search />
          </button>

          {/* Notifications */}
          <Link 
            href="/dashboard/support"
            className="relative w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all"
          >
            <Icons.Bell />
            {unseenCount > 0 && (
              <div className="absolute top-0 right-0 w-[14px] h-[14px] bg-[#111] border-[2.5px] border-white rounded-full" />
            )}
          </Link>

          {/* Avatar */}
          <div className="w-[42px] h-[42px] rounded-full bg-[#e0e0e0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] ml-1 border-2 border-white">
             {/* Note: The mockup has a photo, but we'll stick with initials matching the gray/black theme */}
            <span className="text-[13px] font-bold text-[#111]">{initials}</span>
          </div>

        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 lg:px-10 pb-10 custom-scrollbar">
        {children}
      </div>
      
    </main>
  );
}
