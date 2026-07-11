"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/prospects", label: "Prospects", icon: "🎯" },
  { href: "/dashboard/inbox", label: "Inbox", icon: "💬" },
  { href: "/dashboard/audits", label: "Audits", icon: "🔍" },
  { href: "/dashboard/pitches", label: "Pitches", icon: "✍️" },
  { href: "/dashboard/telegram", label: "Telegram", icon: "🤖" },
];

const bottomLinks = [
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
];

interface SidebarProps {
  orgPlan?: string;
  orgName?: string;
}

export function Sidebar({ orgPlan = "free", orgName = "Knight" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAgency = orgPlan === "agency";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <aside className="w-56 h-screen sticky top-0 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
      <div className="px-4 h-14 flex items-center border-b border-neutral-800">
        <Link href="/dashboard" className="font-display text-lg text-paper-100">
          {isAgency ? orgName : "Knight"}
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === link.href
                ? "bg-neutral-800 text-paper-100"
                : "text-neutral-400 hover:text-paper-100 hover:bg-neutral-900"
            )}
          >
            <span className="text-sm">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-neutral-800 space-y-0.5">
        {bottomLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === link.href
                ? "bg-neutral-800 text-paper-100"
                : "text-neutral-400 hover:text-paper-100 hover:bg-neutral-900"
            )}
          >
            <span className="text-sm">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-colors w-full"
        >
          <span className="text-sm">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
