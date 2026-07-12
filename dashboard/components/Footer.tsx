import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How it works" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund", label: "Refund Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#080808]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-700 text-white tracking-tight block mb-3">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                <path d="M16 6l-1 18h2L16 6z" fill="#fff"/>
                <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff"/>
              </svg>
              Knight
            </Link>
            <p className="text-sm text-[#525252] leading-relaxed max-w-xs">
              Autonomous AI sales agent for web agencies. Finds leads, audits sites, closes deals.
            </p>
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
          <p className="text-xs text-[#3a3a3a]">
            Built to automate outreach. Not affiliated with Google or Telegram.
          </p>
        </div>
      </div>
    </footer>
  );
}
