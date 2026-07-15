"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KnightLogo } from "@/components/KnightLogo";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  Overview: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Prospects: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Inbox: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Audits: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Pitches: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Telegram: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  Settings: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Team: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Billing: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Logout: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  PlusDashed: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" {...p}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
};

const mainLinks = [
  { href: "/dashboard",           label: "Dashboard",  Icon: Icons.Overview,  exact: true },
  { href: "/dashboard/prospects", label: "Prospects",  Icon: Icons.Prospects },
  { href: "/dashboard/inbox",     label: "Inbox",      Icon: Icons.Inbox },
  { href: "/dashboard/audits",    label: "Audits",     Icon: Icons.Audits },
  { href: "/dashboard/pitches",   label: "Pitches",    Icon: Icons.Pitches },
];

const integrationLinks = [
  { href: "/dashboard/telegram",  label: "Telegram",   Icon: Icons.Telegram },
];

interface SidebarProps {
  orgPlan?: string;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ orgPlan = "free", userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-[230px] h-full bg-white/95 rounded-l-[32px] sm:rounded-l-[40px] flex flex-col shrink-0">
      
      {/* Logo Area */}
      <div className="px-8 pt-10 pb-6 flex items-center">
        <div className="flex items-center gap-2">
          <KnightLogo href="/dashboard" variant="light" size={24} />
          <span className="font-bold text-[19px] tracking-tight text-[#111]">Knight</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-5 space-y-1">
        {mainLinks.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 group ${
                active
                  ? "bg-[#111] text-white shadow-sm"
                  : "text-[#555] hover:text-[#111] hover:bg-[#f5f5f5]"
              }`}
            >
              <Icon className={active ? "text-white" : "text-[#777] group-hover:text-[#333]"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Integrations Section */}
      <div className="mt-8 px-5">
        <h3 className="px-4 text-[10px] font-bold text-[#999] uppercase tracking-wider mb-2">
          Integrations
        </h3>
        <div className="space-y-1">
          {integrationLinks.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-2xl text-[14px] font-medium transition-all duration-200 group ${
                  active
                    ? "bg-[#111] text-white"
                    : "text-[#555] hover:text-[#111] hover:bg-[#f5f5f5]"
                }`}
              >
                <Icon className={active ? "text-white" : "text-[#777] group-hover:text-[#333]"} />
                {label}
              </Link>
            );
          })}
          
          {/* Mock "Add new" to match design */}
          <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-2xl text-[14px] font-medium text-[#777] hover:text-[#111] hover:bg-[#f5f5f5] transition-all group">
            <Icons.PlusDashed className="text-[#999] group-hover:text-[#333]" />
            Add new integration
          </button>
        </div>
      </div>

      {/* Teams / Workspace Section */}
      <div className="mt-8 px-5">
        <h3 className="px-4 text-[10px] font-bold text-[#999] uppercase tracking-wider mb-3">
          Teams
        </h3>
        <div className="space-y-1">
          <Link href="/dashboard/team" className="flex items-center gap-4 px-4 py-2 rounded-xl text-[14px] font-medium text-[#555] hover:text-[#111] transition-all">
            <div className="w-2 h-2 rounded-full bg-[#111]" />
            Admins
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-4 px-4 py-2 rounded-xl text-[14px] font-medium text-[#888] hover:text-[#111] transition-all">
            <div className="w-2 h-2 rounded-full bg-[#ccc]" />
            Billing
          </Link>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings (Bottom) */}
      <div className="px-5 pb-8 mt-6">
        <Link 
          href="/dashboard/settings" 
          className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 group ${
            isActive("/dashboard/settings")
              ? "bg-[#111] text-white"
              : "text-[#555] hover:text-[#111] hover:bg-[#f5f5f5]"
          }`}
        >
          <Icons.Settings className={isActive("/dashboard/settings") ? "text-white" : "text-[#777] group-hover:text-[#333]"} />
          Settings
        </Link>
      </div>
      
    </aside>
  );
}
