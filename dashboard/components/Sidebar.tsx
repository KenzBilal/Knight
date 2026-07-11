"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// ─── Icons (inline SVG — no library needed) ───────────────────────────────────
const Icons = {
  Overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Prospects: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Inbox: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  Audits: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Pitches: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Telegram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  Settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Billing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

const mainLinks = [
  { href: "/dashboard", label: "Overview", icon: Icons.Overview, exact: true },
  { href: "/dashboard/prospects", label: "Prospects", icon: Icons.Prospects },
  { href: "/dashboard/inbox", label: "Inbox", icon: Icons.Inbox },
  { href: "/dashboard/audits", label: "Audits", icon: Icons.Audits },
  { href: "/dashboard/pitches", label: "Pitches", icon: Icons.Pitches },
  { href: "/dashboard/telegram", label: "Telegram", icon: Icons.Telegram },
];

const bottomLinks = [
  { href: "/dashboard/settings", label: "Settings", icon: Icons.Settings },
  { href: "/dashboard/billing", label: "Billing", icon: Icons.Billing },
];

const planColors: Record<string, string> = {
  free: "text-[#525252] bg-white/[0.03]",
  starter: "text-[#a3a3a3] bg-white/[0.05]",
  pro: "text-white bg-white/[0.08]",
  agency: "text-white bg-white/[0.1]",
};

interface SidebarProps {
  orgPlan?: string;
  orgName?: string;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({
  orgPlan = "free",
  userEmail,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail
    ? userEmail[0].toUpperCase()
    : "K";

  return (
    <aside
      className={`h-screen sticky top-0 border-r border-white/[0.05] bg-[#0a0a0a] flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Header */}
      <div className={`h-14 flex items-center border-b border-white/[0.05] relative ${collapsed ? "justify-center px-0" : "px-4 justify-between"}`}>
        {!collapsed && (
          <Link
            href="/dashboard"
            className="font-display text-lg font-700 text-white tracking-tight"
          >
            Knight
          </Link>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-6 h-6 flex items-center justify-center rounded text-[#525252] hover:text-[#a3a3a3] hover:bg-white/[0.04] transition-all"
        >
          {collapsed ? Icons.ChevronRight : Icons.ChevronLeft}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Dashboard navigation">
        {mainLinks.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg text-sm transition-all duration-150 ${
                collapsed ? "justify-center px-0 py-2.5 h-9" : "px-3 py-2"
              } ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-[#525252] hover:text-[#a3a3a3] hover:bg-white/[0.03]"
              }`}
            >
              <span className={`flex-shrink-0 ${active ? "text-white" : ""}`}>
                {link.icon}
              </span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-3 border-t border-white/[0.05] pt-2 space-y-0.5">
        {bottomLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg text-sm transition-all duration-150 ${
                collapsed ? "justify-center px-0 py-2.5 h-9" : "px-3 py-2"
              } ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-[#525252] hover:text-[#a3a3a3] hover:bg-white/[0.03]"
              }`}
            >
              <span className={`flex-shrink-0 ${active ? "text-white" : ""}`}>
                {link.icon}
              </span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center gap-2.5 rounded-lg text-sm text-[#525252] hover:text-[#f87171] hover:bg-[#f87171]/[0.06] transition-all duration-150 w-full ${
            collapsed ? "justify-center px-0 py-2.5 h-9" : "px-3 py-2"
          }`}
        >
          <span className="flex-shrink-0">{Icons.Logout}</span>
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User info */}
        {!collapsed && (
          <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-mono font-500 text-[#a3a3a3]">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#525252] truncate">
                {userName || userEmail || "Account"}
              </p>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${planColors[orgPlan] || planColors.free}`}>
                {orgPlan}
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center py-2">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-mono font-500 text-[#a3a3a3]">
                {initials}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
