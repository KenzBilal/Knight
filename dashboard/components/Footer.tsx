import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm text-neutral-500">Knight</span>
            {links.map(link => (
              <Link key={link.href} href={link.href} className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="text-xs text-neutral-500">&copy; {new Date().getFullYear()} Knight. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
