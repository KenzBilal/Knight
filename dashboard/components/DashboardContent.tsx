// DashboardContent — main scroll area with top header bar

"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/prospects": "Prospects",
  "/dashboard/inbox": "Inbox",
  "/dashboard/audits": "Audits",
  "/dashboard/pitches": "Pitches",
  "/dashboard/telegram": "Telegram",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
  "/dashboard/wizard": "Setup Wizard",
};

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Find the best-matching title
  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles)
      .filter(([key]) => pathname.startsWith(key) && key !== "/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    "Dashboard";

  return (
    <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-white/[0.05] bg-[#0a0a0a] flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-medium text-[#a3a3a3]">{title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#080808]">
        {children}
      </div>
    </main>
  );
}
