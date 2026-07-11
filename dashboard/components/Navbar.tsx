"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-paper-100 tracking-tight">
          Knight
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-paper-100 font-medium"
                  : "text-neutral-400 hover:text-paper-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-neutral-400 hover:text-paper-100 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-4 py-2 text-sm hover:bg-paper-200 transition-all active:scale-[0.98]"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
