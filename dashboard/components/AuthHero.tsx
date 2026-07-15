"use client";

import { KnightLogo } from "@/components/KnightLogo";

const ADAM_LINES = [
  "                                                                        ",
  "                            .,:;+?S##S?+:,.                            ",
  "                        ,+S###############################S+,          ",
  "                     ,?#######################################+.        ",
  "                   ,?###########################################?       ",
  "                  +###############################################+     ",
  "                 ?##################################################?   ",
  "                S####################################################S  ",
  "               ?######################################################? ",
  "              ,########################################################,",
  "              S########################################################S",
  "              #########################################################?",
  "              S#######################################################S ",
  "               ?#####################################################?  ",
  "                +###################################################?   ",
  "                 +#################################################?    ",
  "              .,:?S###############################################S?,   ",
  "           ,?S####################################################S+,   ",
  "         +S###########S##############################################?  ",
  "        ?#############+ ?S###########S+ +###########################S?  ",
  "       +##############,   +?????????+   ,?###########################+  ",
  "      ?###############,                  ,###########################?  ",
  "     +################.                   .##########################S  ",
  "    ,################S.     .,+??+,.       S#########################S  ",
  "    ?################?   .+S#########S+.   ?#########################+  ",
  "    S################S  .S#############S.  S##########################  ",
  "    ####################S###############S###########################S#  ",
  "    S###################################################################  ",
  "    +###################################################################+ ",
  "     S#################################################################S ",
  "      ?###############################################################?  ",
  "       +?S###########################################################S+  ",
  "           .,+?S######################################S?+,.              ",
  "                  .,:;+?SS######################SS?+:,.                 ",
  "                                                                        ",
];

function AsciiArt() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <pre
        className="text-[9px] sm:text-[11px] md:text-[13px] leading-[1.15] font-mono text-white/[0.12] whitespace-pre animate-float"
        style={{ letterSpacing: "0.08em" }}
      >
        {ADAM_LINES.join("\n")}
      </pre>
    </div>
  );
}

function NoiseTexture() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
      aria-hidden="true"
    >
      <filter id="noise-auth">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-auth)" />
    </svg>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Large radial glow — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          animation: "float-slow 12s ease-in-out infinite",
        }}
      />
      {/* Top-left orb */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
          animation: "float-slow 16s ease-in-out infinite reverse",
        }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
          animation: "float-slow 14s ease-in-out infinite 4s",
        }}
      />
    </div>
  );
}

function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

const TESTIMONIALS = [
  {
    quote: "Knight transformed how we approach outbound. Pipeline up 3× in 90 days.",
    author: "Sarah Chen",
    role: "VP Sales, Acme Corp",
  },
  {
    quote: "The AI finds angles our team would never think of. It's like hiring 10 SDRs.",
    author: "Marcus Rivera",
    role: "Founder, Scalepath",
  },
  {
    quote: "Every prospect email feels handcrafted. Open rates jumped from 12% to 41%.",
    author: "Priya Nair",
    role: "Growth Lead, Nexus AI",
  },
];

export function AuthHero({ mode }: { mode: "login" | "signup" }) {
  const testimonial = TESTIMONIALS[mode === "login" ? 0 : 1];

  return (
    <div className="relative flex flex-col justify-between h-full p-10 lg:p-14 overflow-hidden bg-[#0a0a0a]">
      {/* Layered background */}
      <GridPattern />
      <AsciiArt />
      <FloatingOrbs />
      <NoiseTexture />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        <KnightLogo href="/" variant="dark" size={28} />
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60 tracking-wide font-medium">
              {mode === "login" ? "Trusted by 500+ sales teams" : "Join 500+ growing companies"}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.05] tracking-tight">
            {mode === "login" ? (
              <>
                Your pipeline,<br />
                <span className="text-white/40">on autopilot.</span>
              </>
            ) : (
              <>
                Close more deals,<br />
                <span className="text-white/40">with less effort.</span>
              </>
            )}
          </h1>

          <p className="text-base text-white/45 leading-relaxed max-w-sm">
            {mode === "login"
              ? "AI-powered outbound that finds your ideal prospects, writes perfect pitches, and books meetings while you sleep."
              : "Knight uses AI to research prospects, craft hyper-personalized outreach, and fill your calendar with qualified meetings."}
          </p>
        </div>

        {/* Testimonial */}
        <div className="border border-white/8 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 space-y-3">
          <p className="text-sm text-white/60 leading-relaxed italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-semibold">
              {testimonial.author[0]}
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">{testimonial.author}</p>
              <p className="text-xs text-white/35">{testimonial.role}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {[
            { value: "3×", label: "Pipeline growth" },
            { value: "41%", label: "Open rate avg" },
            { value: "90d", label: "Time to results" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-0.5">
              <p className="text-xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-white/35">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-50%, -52%) scale(1.04); }
          66% { transform: translate(-48%, -49%) scale(0.97); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(0.5deg); }
          66% { transform: translateY(-6px) rotate(-0.5deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
