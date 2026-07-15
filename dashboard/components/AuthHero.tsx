"use client";

import Image from "next/image";
import Link from "next/link";

export function AuthHero({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="relative w-full h-full bg-[#060606] overflow-hidden flex flex-col">
      {/* Hands image — full bleed with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/hands.png"
          alt="Creation of Adam"
          fill
          className="object-cover object-center opacity-30"
          priority
          sizes="60vw"
        />
        {/* Bottom-to-top gradient fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, #060606 0%, rgba(6,6,6,0.7) 40%, rgba(6,6,6,0.3) 70%, transparent 100%)",
          }}
        />
        {/* Left edge fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(6,6,6,0.6) 0%, transparent 60%)",
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #060606 0%, transparent 30%)",
          }}
        />
      </div>

      {/* Grain overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden="true">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16">
        {/* Top: logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/knight_logo.png"
              alt="Knight"
              width={32}
              height={32}
              className="rounded-[7px]"
            />
            <span className="text-white font-semibold text-[17px] tracking-tight">Knight</span>
          </Link>
        </div>

        {/* Bottom: editorial copy */}
        <div className="space-y-6">
          {/* Rule */}
          <div className="w-8 h-px bg-white/20" />

          <div className="space-y-3">
            <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em]">
              AI-Powered Outbound
            </p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white leading-[1.05] tracking-tight">
              {mode === "login" ? (
                <>Your pipeline,<br /><span className="text-white/40">on autopilot.</span></>
              ) : (
                <>Close more.<br /><span className="text-white/40">Work less.</span></>
              )}
            </h2>
          </div>

          <p className="text-[14px] text-white/40 leading-relaxed max-w-[280px]">
            Knight finds prospects, writes perfect pitches, and books meetings — while you sleep.
          </p>

          {/* Bottom credits */}
          <p className="text-[11px] text-white/20 tracking-wider">
            © {new Date().getFullYear()} Knight
          </p>
        </div>
      </div>
    </div>
  );
}
