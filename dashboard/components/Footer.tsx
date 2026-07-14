import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/enterprise", label: "Enterprise" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/contact-sales", label: "Contact Sales" },
  ],
  Trust: [
    { href: "/security", label: "Security" },
    { href: "/trust", label: "Trust Center" },
    { href: "/privacy", label: "Privacy" },
  ],
  Legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund", label: "Refund Policy" },
    { href: "/cookie-policy", label: "Cookie Policy" },
    { href: "/acceptable-use", label: "Acceptable Use" },
    { href: "/ai-policy", label: "AI Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#080808]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-700 text-white tracking-tight block mb-3">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                <path d="M16 6l-1 18h2L16 6z" fill="#fff"/>
                <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff"/>
              </svg>
              Knight
            </Link>
            <p className="text-sm text-[#525252] leading-relaxed max-w-xs mb-6">
              Autonomous AI sales agent for web agencies. Finds leads, audits sites, closes deals.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#3a3a3a] border border-white/[0.04] rounded-full px-2.5 py-1">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L2 3v3c0 2.5 1.7 4.7 4 5 2.3-.3 4-2.5 4-5V3L6 1z" stroke="#3a3a3a" strokeWidth="1" strokeLinejoin="round"/></svg>
                Secure by Design
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#3a3a3a] border border-white/[0.04] rounded-full px-2.5 py-1">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="10" height="7" rx="1.5" stroke="#3a3a3a" strokeWidth="1"/><path d="M4 4V3a2 2 0 014 0v1" stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round"/></svg>
                Encrypted Data
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#3a3a3a] border border-white/[0.04] rounded-full px-2.5 py-1">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#3a3a3a" strokeWidth="1"/><path d="M6 3v3l2 1" stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round"/></svg>
                99.9% Uptime
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-medium text-[#3a3a3a] uppercase tracking-widest mb-4 font-mono">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#525252] hover:text-[#a3a3a3] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#3a3a3a]">
            © {new Date().getFullYear()} Knight. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-xs text-[#3a3a3a]">
              Built to automate outreach. Not affiliated with Google or Telegram.
            </p>
            <Link href="/security" className="text-xs text-[#3a3a3a] hover:text-[#525252] transition-colors">
              Security
            </Link>
            <Link href="/trust" className="text-xs text-[#3a3a3a] hover:text-[#525252] transition-colors">
              Trust Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
