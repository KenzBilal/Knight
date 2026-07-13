"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeroContent {
  headline: string;
  subheadline: string;
  tagline: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
  social_proof: string;
}
interface StatItem { value: string; label: string }
interface StepItem { number: string; title: string; description: string }
interface FeatureItem { icon: string; title: string; description: string }
interface FaqItem { q: string; a: string }
interface CtaContent {
  heading: string;
  subheading: string;
  description: string;
  button: string;
}
export interface LandingContent {
  hero?: HeroContent;
  stats?: StatItem[];
  steps?: StepItem[];
  features?: FeatureItem[];
  faq?: FaqItem[];
  cta?: CtaContent;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_HERO: HeroContent = {
  headline: "Your AI sales rep",
  subheadline: "works 24/7.",
  tagline: "AI-powered B2B sales automation",
  description:
    "Knight finds businesses that need your service, audits their website, writes a personalized pitch, and sends it — automatically.",
  cta_primary: "Start free — no card required",
  cta_secondary: "See how it works",
  social_proof: "Free tier includes 50 leads and 50 emails per month",
};

const DEFAULT_STATS: StatItem[] = [
  { value: "30+", label: "Audit checks per site" },
  { value: "24/7", label: "Runs without you" },
  { value: "2 min", label: "Setup time" },
];

const DEFAULT_STEPS: StepItem[] = [
  {
    number: "01",
    title: "Tell Knight who to target",
    description:
      "Enter a business type and location. Knight searches Google Maps and finds real businesses matching your niche.",
  },
  {
    number: "02",
    title: "It audits every site",
    description:
      "Each lead gets a full 30-point website audit — SEO, performance, security, tech stack. Scored 0–100. Lower = more broken = hotter lead.",
  },
  {
    number: "03",
    title: "It pitches for you",
    description:
      "Knight writes a personalized cold email referencing specific problems it found, sends it, follows up, and handles replies — automatically.",
  },
];

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: "🔍",
    title: "Deep Website Audit",
    description:
      "30+ checks across SEO, performance, security, and tech stack. Every lead gets scored before you spend a second on them.",
  },
  {
    icon: "✍️",
    title: "AI Pitch Generation",
    description:
      "Gemini writes cold emails that reference specific issues on the prospect's site. Not templates. Actual context.",
  },
  {
    icon: "📞",
    title: "Autonomous Outreach",
    description:
      "Cold email with day 3 follow-up and day 7 breakup sequence. Telegram agent that holds real conversations. Runs 24/7 without you.",
  },
  {
    icon: "💬",
    title: "Smart Inbox",
    description:
      "When a prospect replies, AI classifies the intent and drafts a contextual response. You review once and send.",
  },
  {
    icon: "📊",
    title: "CRM Pipeline",
    description:
      "Kanban board from discovery to closed. Drag cards between stages. Every deal tracked in one place.",
  },
  {
    icon: "🔒",
    title: "BYOK Security",
    description:
      "Your API keys, your data. Knight uses Cohere, Gemini, and OpenRouter — all with generous free tiers. Costs you near zero.",
  },
];

const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Do I need my own API keys?",
    a: "Yes — and that's the point. Knight uses your Cohere, Gemini, and OpenRouter keys. All three have free tiers that cover hundreds of leads per day. You pay directly, nothing is marked up.",
  },
  {
    q: "How does the website audit work?",
    a: "Knight visits the target site with a headless browser, runs 30+ checks across SEO, performance, security, and tech stack, then scores it. Lower score means bigger problems — hotter lead.",
  },
  {
    q: "Does the Telegram agent work automatically?",
    a: "Yes. Once connected, it finds leads in Telegram groups, sends personalized pitches, handles replies using AI, and runs a 7-day drip sequence — completely on autopilot.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Cancel from your billing page and keep access until the end of your billing period.",
  },
  {
    q: "What happens when a prospect replies?",
    a: "Knight classifies the intent (interested vs. rejected). If interested, it drafts a contextual reply using Gemini. You review the draft and send with one click.",
  },
];

const DEFAULT_CTA: CtaContent = {
  heading: "Stop doing sales",
  subheading: "manually.",
  description:
    "Set it up in two minutes. Knight finds your first lead before you finish your coffee.",
  button: "Create your free account",
};

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    items.forEach((item) => {
      // If already visible (e.g. navigated via #hash), reveal immediately
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        (item as HTMLElement).classList.add("revealed");
      } else {
        observer.observe(item);
      }
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-white/[0.05] last:border-0">
      <summary className="flex items-center justify-between py-5 cursor-pointer list-none text-sm font-medium text-[#d4d4d4] hover:text-white transition-colors select-none">
        {q}
        <span className="flex-shrink-0 ml-4 text-[#525252] transition-transform duration-200 group-open:rotate-45">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </span>
      </summary>
      <div className="pb-5 text-sm text-[#737373] leading-relaxed pr-8">{a}</div>
    </details>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export function LandingPage({ content }: { content: LandingContent | null }) {
  const hero = content?.hero ?? DEFAULT_HERO;
  const stats = content?.stats ?? DEFAULT_STATS;
  const steps = content?.steps ?? DEFAULT_STEPS;
  const features = content?.features ?? DEFAULT_FEATURES;
  const faq = content?.faq ?? DEFAULT_FAQ;
  const cta = content?.cta ?? DEFAULT_CTA;

  const revealRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-40 md:pt-44 md:pb-56">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
          <h1 className="font-display font-800 text-6xl md:text-7xl lg:text-8xl text-white tracking-tight mb-6 animate-fade-up">
            Knight
          </h1>

          <p className="text-sm font-mono text-[#525252] uppercase tracking-widest mb-10 animate-fade-up animate-delay-100">
            {hero.tagline}
          </p>

          <h2
            className="font-display font-800 text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight mb-8 animate-fade-up animate-delay-200"
            style={{ animationFillMode: "both" }}
          >
            {hero.headline}
            <br />
            <span className="text-[#525252]">{hero.subheadline}</span>
          </h2>

          <p
            className="text-base md:text-lg text-[#737373] leading-relaxed max-w-xl mb-10 animate-fade-up animate-delay-300"
            style={{ animationFillMode: "both" }}
          >
            {hero.description}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up animate-delay-400"
            style={{ animationFillMode: "both" }}
          >
            <Link href="/auth/signup" className="btn-primary px-7 py-3 text-sm font-semibold">
              {hero.cta_primary}
            </Link>
            <Link href="#how-it-works" className="btn-ghost px-7 py-3 text-sm">
              {hero.cta_secondary}
            </Link>
          </div>

          <p
            className="mt-8 text-xs text-[#3a3a3a] animate-fade-up animate-delay-500"
            style={{ animationFillMode: "both" }}
          >
            {hero.social_proof}
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/[0.05] bg-[#0f0f0f]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl md:text-4xl font-700 text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-[#525252]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-28 md:py-36" ref={revealRef}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-20 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight">
              Three steps to automated outreach
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`reveal reveal-delay-${i + 1} bg-[#080808] p-8 md:p-10`}
              >
                <p className="font-mono text-5xl font-500 text-[#1f1f1f] mb-6 leading-none">
                  {step.number}
                </p>
                <h3 className="font-display text-lg font-600 text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 md:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6" ref={revealRef}>
          <div className="text-center mb-20 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight">
              Everything to close deals
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${(i % 3) + 1} card card-hover p-7 group`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-lg group-hover:bg-white/[0.07] transition-all duration-200 mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-600 text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 md:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl px-6" ref={revealRef}>
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-700 text-white">
              Questions, answered
            </h2>
          </div>

          <div className="reveal reveal-delay-1">
            {faq.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 md:py-36 border-t border-white/[0.04] bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-6 text-center" ref={revealRef}>
          <div className="reveal">
            <h2 className="font-display text-4xl md:text-6xl font-700 text-white leading-tight mb-6">
              {cta.heading}
              <br />
              <span className="text-[#3a3a3a]">{cta.subheading}</span>
            </h2>
            <p className="text-sm text-[#525252] mb-10 max-w-md mx-auto">
              {cta.description}
            </p>
            <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-sm font-semibold">
              {cta.button}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
