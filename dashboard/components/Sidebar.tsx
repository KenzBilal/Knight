"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KnightLogo } from "@/components/KnightLogo";
import { SetupRequiredModal } from "@/components/SetupRequiredModal";


// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  Overview: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Prospects: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Inbox: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Audits: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Templates: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Pitches: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Telegram: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  Integrations: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Settings: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Team: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Billing: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Logout: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const mainLinks = [
  { href: "/dashboard",           label: "Overview",    Icon: Icons.Overview,  exact: true },
  { href: "/dashboard/prospects", label: "Prospects",   Icon: Icons.Prospects },
  { href: "/dashboard/inbox",     label: "Inbox",       Icon: Icons.Inbox },
  { href: "/dashboard/templates", label: "Templates",   Icon: Icons.Templates },
  { href: "/dashboard/audits",    label: "Audits",      Icon: Icons.Audits },
  { href: "/dashboard/telegram",  label: "Telegram",    Icon: Icons.Telegram },
  { href: "/dashboard/integrations", label: "Integrations", Icon: Icons.Integrations },
];

const profileMenuLinks = [
  { href: "/dashboard/pitches",   label: "Pitches",    Icon: Icons.Pitches },
  { href: "/dashboard/team",      label: "Team",       Icon: Icons.Team },
  { href: "/dashboard/settings",  label: "Settings",   Icon: Icons.Settings },
  { href: "/dashboard/billing",   label: "Billing",    Icon: Icons.Billing },
];

interface SidebarProps {
  orgPlan?: string;
  userEmail?: string;
  userName?: string;
  userRole?: "owner" | "admin" | "member";
  onboardingIncomplete?: boolean;
  onClose?: () => void;
}

export function Sidebar({ orgPlan = "free", userEmail, userName, userRole = "member", onboardingIncomplete, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isFree = orgPlan === "free";
  const isStarter = orgPlan === "starter";
  const isOwner = userRole === "owner";
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const locked = !!onboardingIncomplete;

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const initials = userName
    ? userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : "K";

  const profileLinks = profileMenuLinks.filter(({ href }) => {
    if (href === "/dashboard/team" && !isOwner) return false;
    return true;
  });

  return (
    <aside className="w-[240px] h-full bg-[#080808] flex flex-col shrink-0 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-6 h-[80px] flex items-center border-b border-white/[0.06]">
        <KnightLogo href="/dashboard" variant="dark" size={28} />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {mainLinks
          .filter(({ href }) => {
            if (href === "/dashboard/templates" && isFree) return false;
            if (href === "/dashboard/inbox" && isFree) return false;
            return true;
          })
          .map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          const isLocked = locked && href !== "/dashboard";
          return (
            <Link
              key={href}
              href={isLocked ? "#" : href}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  setShowSetupModal(true);
                  return;
                }
                onClose?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-all duration-200 group ${
                isLocked
                  ? "text-[#333] cursor-not-allowed opacity-50"
                  : active
                    ? "bg-white/[0.08] text-white"
                    : "text-[#737373] hover:text-[#a3a3a3] hover:bg-white/[0.04]"
              }`}
            >
              <Icon className={active && !isLocked ? "text-white" : "text-[#525252] group-hover:text-[#737373]"} />
              {label}
              {isLocked && (
                <svg className="ml-auto w-3 h-3 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro card — only for free plan */}
      {isFree && (
        <div className="mx-3 mb-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-[1px]">
            <div className="rounded-[11px] bg-[#0c0c0c] p-4">
              <div className="mb-2.5">
                <p className="text-[13px] font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Upgrade to Pro
                </p>
              </div>
              <p className="text-[11px] text-[#525252] mb-3.5 leading-relaxed">
                Telegram agent, unlimited leads & drip sequences.
              </p>
              <Link
                href="/dashboard/billing"
                className="flex items-center justify-center gap-1.5 w-full bg-white text-[#080808] rounded-lg py-2 text-[12px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                Upgrade
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* User profile — fixed at bottom, menu expands above */}
      <div
        className="relative px-4 pb-4 pt-2 mt-auto"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {/* Menu — absolutely positioned above the profile */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 px-4 pb-2">
            <div className="bg-[#111] border border-white/[0.09] rounded-xl overflow-hidden shadow-2xl shadow-black/60">
              <div className="p-1.5">
                {profileLinks.map(({ href, label, Icon }) => {
                  const active = isActive(href);
                  const isLocked = locked && href !== "/dashboard";
                  return (
                    <Link
                      key={href}
                      href={isLocked ? "#" : href}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          setShowSetupModal(true);
                          setMenuOpen(false);
                          return;
                        }
                        setMenuOpen(false);
                        onClose?.();
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                        isLocked
                          ? "text-[#333] cursor-not-allowed opacity-50"
                          : active
                            ? "bg-white/[0.08] text-white"
                            : "text-[#737373] hover:text-[#a3a3a3] hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className={active && !isLocked ? "text-white" : "text-[#525252]"} />
                      {label}
                      {isLocked && (
                        <svg className="ml-auto w-3 h-3 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-white/[0.06] p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#737373] hover:text-[#f87171] hover:bg-white/[0.04] transition-colors w-full"
                >
                  <Icons.Logout className="text-[#525252]" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile row — always in the same spot */}
        <div className="bg-[#111] border border-white/[0.09] rounded-xl px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[12px] font-medium text-white truncate">{userName || userEmail || "Account"}</p>
              <p className="text-[10px] font-medium text-[#525252] capitalize">{orgPlan} plan</p>
            </div>
            <svg className={`w-3.5 h-3.5 text-[#3a3a3a] transition-transform ${menuOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* Setup required modal */}
      <SetupRequiredModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </aside>
  );
}
