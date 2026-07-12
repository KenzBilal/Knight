"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Icons = {
  Overview: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Prospects: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Inbox: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  Audits: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Pitches: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Telegram: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
    </svg>
  ),
  Settings: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Team: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Billing: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Logout: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Lightning: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
};

const mainLinks = [
  { href: "/dashboard", label: "Overview", Icon: Icons.Overview, exact: true },
  { href: "/dashboard/prospects", label: "Prospects", Icon: Icons.Prospects },
  { href: "/dashboard/inbox", label: "Inbox", Icon: Icons.Inbox },
  { href: "/dashboard/audits", label: "Audits", Icon: Icons.Audits },
  { href: "/dashboard/pitches", label: "Pitches", Icon: Icons.Pitches },
  { href: "/dashboard/telegram", label: "Telegram", Icon: Icons.Telegram },
];

const bottomLinks = [
  { href: "/dashboard/team", label: "Team", Icon: Icons.Team },
  { href: "/dashboard/settings", label: "Settings", Icon: Icons.Settings },
  { href: "/dashboard/billing", label: "Billing", Icon: Icons.Billing },
];

interface SidebarProps {
  orgPlan?: string;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ orgPlan = "free", userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isFree = orgPlan === "free";

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : "K";

  return (
    <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#111" stroke="#333" strokeWidth="1" />
            <path d="M16 6l-1 18h2L16 6z" fill="#fff" />
            <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff" />
          </svg>
          <span className="font-display text-lg font-bold text-gray-900 tracking-tight">Knight</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainLinks.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className={active ? "text-white" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {isFree && (
        <div className="mx-3 mb-3">
          <div className="rounded-xl bg-gray-900 p-4 text-white">
            <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">
              <Icons.Lightning className="text-yellow-400" />
              Upgrade to Pro
            </p>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Unlock Telegram agent, unlimited leads and drip sequences.
            </p>
            <Link
              href="/dashboard/billing"
              className="block w-full text-center bg-white text-gray-900 rounded-lg py-2 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Bottom links */}
      <div className="px-3 pb-2 border-t border-gray-100 pt-3 space-y-0.5">
        {bottomLinks.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className={active ? "text-white" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <Icons.Logout className="text-gray-400" />
          Log out
        </button>
      </div>

      {/* User row */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-white">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-900 truncate">{userName || userEmail || "Account"}</p>
          <p className="text-[10px] text-gray-400 capitalize">{orgPlan} plan</p>
        </div>
      </div>
    </aside>
  );
}
