"use client";

import Image from "next/image";
import Link from "next/link";

// ─── ASCII Art of the Creation of Adam (generated from image) ───────────────
// Chars: space=dark/transparent background, @#S%=bright hand pixels
const ADAM_LINES = [
  "                                                                                                                                              ",
  "                                                                                                                                              ",
  "                                                                                                                                              ",
  "                                                                                                                              ,@@@##@@@#       ",
  "                                                              +#%;:,,;+*?%%??*,             .,:+*+;,   @@#@@                 +@@#@@@@@##S%?*  ",
  "                                  .*S@@@@@@#*;,  ..+%S%?+    *?              ,:: .%@#@@@@@@@@@##SSS%%%SS#SSSSS#SSSS%%%?*?%%%????++*%?*+;,    ",
  "                    ,%@@@#@@###@@#%+,...;;+;;,,. ,?               ..,  +@##@@#SSSS%%??*:,****+;+%%?*+**???+;*????*****:..;.              .,:;",
  "                 .*#@@#@@##@@@##@@@###@@##@@@@#S?;,,,.    @@#       :@%,   +@@#*;,,,,;++**??+;,. ,;: .*,  ,*SS%;,;****+.                     ",
  "              .*#@@@@@@##@@@##@@@##@@@##@@@##@@@@@%;,.    .S@S.      S@@S%%S@@#@@@@@@@@@@@@@@@@@@@*     ,?#%?+,   ,:..                       ",
  "          ,:?#@@@#@@##@@@##@@@##@@@##@@@##@@@##@@@@S       ?@@#      *@#@@@@#@@@###@@###@@###@@@#S*,.;?%?;,                                  ",
  "     .:*%#@@@@#@@@##@@@#@@@@#@@@@#@@@@##@@@#@@@@##@S. +?;,+#@@@,  ,  .@@@##@@@##@@@#@@@@#@@@@S%+;:,*+,,.                       ,?SSSS?+:,.  ",
  "  :?#@@@@@####@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@@@@@@@@S%@S?%@@@@@@@@@@@@@@@@@@@@@@S.;+;+*;       ;?*.             :*#@@@@@@@@@@@@#S%",
  "%@@@@###@@##@@@##@@@##@@@##@@@##@@@##@@@##@@@##@@@##@@@###@@##@@@@#@@@##@@@##@@@##@@@##@@@##@?;,..    ,;    .,,.   ,.    ,*@@@##@@###@@###@@@@",
  "                                                                                                                                              ",
  "                                                                                                                                              ",
];

function AsciiPanel() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <pre
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "7.5px",
          lineHeight: "1.1",
          letterSpacing: "0.02em",
          color: "rgba(255,255,255,0.55)",
          whiteSpace: "pre",
          fontWeight: "700",
          transform: "rotate(-2deg) scale(1.15)",
          transformOrigin: "center center",
        }}
      >
        {ADAM_LINES.join("\n")}
      </pre>
    </div>
  );
}

export function AuthHero({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="relative w-full h-full bg-[#060606] overflow-hidden flex flex-col">
      {/* Grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        aria-hidden="true"
      >
        <filter id="hero-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* ASCII Art centrepiece */}
      <AsciiPanel />

      {/* Radial vignette to fade edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, rgba(6,6,6,0.8) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Edge darkening — helps text stay readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,6,6,0.85) 0%, transparent 25%, transparent 70%, rgba(6,6,6,0.9) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16">
        {/* Top: logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/knight_logo.png"
              alt="Knight"
              width={30}
              height={30}
              className="rounded-[7px]"
            />
            <span className="text-white font-semibold text-[17px] tracking-tight">
              Knight
            </span>
          </Link>
        </div>

        {/* Bottom: editorial copy */}
        <div className="space-y-5">
          <div className="w-8 h-px bg-white/20" />
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.25em]">
              AI-Powered Outbound
            </p>
            <h2 className="text-4xl lg:text-[44px] font-semibold text-white leading-[1.05] tracking-tight">
              {mode === "login" ? (
                <>
                  Your pipeline,
                  <br />
                  <span className="text-white/35">on autopilot.</span>
                </>
              ) : (
                <>
                  Close more.
                  <br />
                  <span className="text-white/35">Work less.</span>
                </>
              )}
            </h2>
          </div>
          <p className="text-[14px] text-white/35 leading-relaxed max-w-[260px]">
            Knight finds prospects, writes perfect pitches, and books meetings — while you sleep.
          </p>
          <p className="text-[10px] text-white/15 tracking-widest font-mono">
            © {new Date().getFullYear()} KNIGHT
          </p>
        </div>
      </div>
    </div>
  );
}
