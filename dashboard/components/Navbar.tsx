"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#080808]/95 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-xl font-700 text-white tracking-tight"
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                <path d="M16 6l-1 18h2L16 6z" fill="#fff"/>
                <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff"/>
              </svg>
              Knight
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#a3a3a3] hover:text-white transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-[#737373] hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary text-sm px-4 py-2"
              >
                Start free
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2 group"
            >
              <span
                className={`block h-px w-5 bg-[#a3a3a3] transition-all duration-200 ${
                  mobileOpen ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-[#a3a3a3] transition-all duration-200 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-[#a3a3a3] transition-all duration-200 ${
                  mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" ref={mobileRef}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-16 left-0 right-0 bg-[#0f0f0f] border-b border-white/[0.06] animate-slide-down">
            <nav className="px-6 py-4 space-y-1" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-sm text-[#a3a3a3] hover:text-white transition-colors border-b border-white/[0.04] last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-2 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="btn-ghost w-full text-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary w-full text-center"
                >
                  Start free
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
