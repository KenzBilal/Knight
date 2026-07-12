"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/prospects":  "Prospects",
  "/dashboard/inbox":      "Inbox",
  "/dashboard/audits":     "Audits",
  "/dashboard/pitches":    "Pitches",
  "/dashboard/telegram":   "Telegram",
  "/dashboard/settings":   "Settings",
  "/dashboard/billing":    "Billing",
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

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles)
      .filter(([key]) => pathname.startsWith(key) && key !== "/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    "Dashboard";

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : "K";

  return (
    <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden bg-[#f5f5f5]">
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
