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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 h-screen border-r border-line bg-ink-950 flex flex-col shrink-0">
      <div className="px-5 h-16 flex items-center border-b border-line">
        <Link href="/dashboard" className="font-display text-lg text-paper-100">Knight</Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === link.href
                ? "bg-flash-500/10 text-flash-500"
                : "text-paper-400 hover:text-paper-100 hover:bg-ink-800"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-line space-y-1">
        {bottomLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === link.href
                ? "bg-flash-500/10 text-flash-500"
                : "text-paper-400 hover:text-paper-100 hover:bg-ink-800"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-paper-400 hover:text-danger-500 hover:bg-ink-800 transition-colors w-full"
        >
          <span className="text-base">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
