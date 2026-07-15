import Image from "next/image";
import Link from "next/link";

interface KnightLogoProps {
  /** "dark" for dark backgrounds (navbar, footer, auth hero), "light" for white backgrounds (sidebar, auth panel) */
  variant?: "dark" | "light";
  size?: number;
  /** If provided, wraps in a Link */
  href?: string;
  className?: string;
}

function LogoInner({ variant = "dark", size = 28, className = "" }: KnightLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/knight_logo.png"
        alt="Knight logo"
        width={size}
        height={size}
        className="rounded-[6px] object-cover"
        priority
      />
      <span
        className={`font-semibold text-[17px] tracking-tight ${
          variant === "dark" ? "text-white" : "text-[#0a0a0a]"
        }`}
      >
        Knight
      </span>
    </span>
  );
}

export function KnightLogo({ href, ...props }: KnightLogoProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex">
        <LogoInner {...props} />
      </Link>
    );
  }
  return <LogoInner {...props} />;
}
