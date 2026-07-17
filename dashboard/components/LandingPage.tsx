"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  HeroVideo,
  InteractiveDemo,
  AnimatedWorkflow,
  Testimonials,
  CaseStudies,
  ROICalculator,
  ComparisonTable,
} from "@/components/LandingExtras";
import { ScrollPathDecoration } from "@/components/ui/svg-follow-scroll";

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
interface FeatureItem { icon: React.ReactNode; title: string; description: string }
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
  headline: "Close more deals.",
  subheadline: "Work less.",
  tagline: "AI-powered B2B outbound — from prospect to booked meeting",
  description:
    "Knight finds qualified leads, audits their websites, writes hyper-personalized pitches, and handles the entire email sequence — all on autopilot. You show up for the meeting.",
  cta_primary: "Generate your first leads free",
  cta_secondary: "See how it works",
  social_proof: "No credit card required · Free plan includes 50 leads and 50 emails/month",
};

const DEFAULT_STATS: StatItem[] = [
  { value: "2 min", label: "From signup to first live campaign" },
  { value: "30+", label: "Lead quality signals checked per prospect" },
  { value: "24/7", label: "Pipeline generated while you sleep" },
];

const DEFAULT_STEPS: StepItem[] = [
  {
    number: "01",
    title: "Define your ideal customer",
    description:
      "Tell Knight your target business type and location. It searches Google Maps, qualifies real businesses, and builds a scored prospect list — in seconds, not hours.",
  },
  {
    number: "02",
    title: "Knight qualifies every lead",
    description:
      "Each prospect gets a 30-point website audit across SEO, performance, and security. Leads with broken sites are your hottest opportunities — Knight finds them automatically.",
  },
  {
    number: "03",
    title: "Personalized outreach, sent for you",
    description:
      "Knight writes a cold email referencing exact problems it found on that prospect's site, sends it, follows up, handles replies, and books meetings — without you lifting a finger.",
  },
];

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    title: "Qualified Leads, Automatically",
    description:
      "Stop wasting time on prospects who aren't ready to buy. Knight scores every lead against 30+ signals so your outreach only goes to high-intent targets.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: "Pitches That Actually Convert",
    description:
      "Forget generic templates. Every email Knight sends references specific, real issues found on that prospect's site — the kind of personalization that gets replies.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    title: "Full Outbound on Autopilot",
    description:
      "Initial email, day-3 follow-up, day-7 breakup. Knight runs your entire outbound sequence and handles incoming replies — generating pipeline around the clock.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: "Replies Handled Intelligently",
    description:
      "When a prospect responds, Knight reads the intent, drafts the perfect reply, and presents it to you for one-click send. Never miss a hot lead again.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    title: "Pipeline You Can See and Trust",
    description:
      "Every prospect tracked from discovery to closed deal. A clean CRM dashboard gives you complete visibility without the complexity of bloated CRMs.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    title: "Your Data Stays Yours",
    description:
      "Knight runs on your own AI API keys (Gemini, Cohere, OpenRouter — all free tiers). Zero markup, zero data sharing. Your leads, your conversations, your business.",
  },
];

const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "How quickly can I generate my first leads?",
    a: "Most users have their first campaign running within 2 minutes of signing up. Set your target business type and location, connect your email, and Knight starts finding and qualifying leads immediately.",
  },
  {
    q: "Do I need to know how to code or use AI?",
    a: "No. Knight is a point-and-click product. You set your target, Knight handles the research, writing, and sending. If you can fill out a form, you can run Knight.",
  },
  {
    q: "What makes the outreach personalized — not just a mail-merge?",
    a: "Knight audits each prospect's website in real-time, finds actual problems (slow load times, missing SEO tags, security gaps), and references those specific issues in the email. The prospect sees you've done your homework — because the AI genuinely has.",
  },
  {
    q: "Do I need my own API keys?",
    a: "Yes — and it's a feature, not a limitation. Your AI keys (Gemini, Cohere, OpenRouter) mean AI costs go directly to providers at cost, with no markup. All three offer free tiers that cover hundreds of leads per day. You keep full control and pay near-zero.",
  },
  {
    q: "What happens when a prospect replies?",
    a: "Knight detects the reply, classifies the intent (interested, rejected, or needs follow-up), and drafts a contextual response using your conversation history. You review the draft and send with one click — or let it handle the full thread.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, always. No contracts, no cancellation fees, no awkward calls. Cancel from your account page and keep full access until your current billing period ends.",
  },
];

const DEFAULT_CTA: CtaContent = {
  heading: "Your pipeline shouldn't",
  subheading: "depend on you.",
  description:
    "Set Knight up in two minutes. It finds prospects, qualifies them, writes the pitch, sends it, and follows up — all before your next coffee. You only show up to close.",
  button: "Start for free — no card required",
};

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Observe ALL .reveal elements in the entire document, not scoped to one ref.
    // The old approach used a single ref shared by multiple sections, so only the
    // last section's elements were observed — leaving earlier sections invisible.
    const items = document.querySelectorAll(".reveal");
    if (items.length === 0) return;
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
  // Always use DEFAULT_FEATURES for icons (SVGs) — merge text from DB if available
  const features = DEFAULT_FEATURES.map((def, i) => ({
    ...def,
    title: content?.features?.[i]?.title ?? def.title,
    description: content?.features?.[i]?.description ?? def.description,
  }));
  const faq = content?.faq ?? DEFAULT_FAQ;
  const cta = content?.cta ?? DEFAULT_CTA;

  const revealRef = useScrollReveal();

  return (
    <div className="relative min-h-screen bg-[#080808] overflow-hidden">
      {/* Canvas scroll path — GPU-composited, zero SVG repaint, true 60fps */}
      <ScrollPathDecoration className="fixed inset-0 w-screen h-screen pointer-events-none hidden lg:block z-0 mix-blend-screen" />

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-40 md:pt-44 md:pb-56 z-10">
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

      {/* ── Hero Video Preview ── */}
      <HeroVideo />

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
              From zero to booked meeting — in three steps
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

      {/* ── Animated Workflow ── */}
      <AnimatedWorkflow />

      {/* ── Interactive Demo ── */}
      <InteractiveDemo />

      {/* ── Features ── */}
      <section id="features" className="py-28 md:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6" ref={revealRef}>
          <div className="text-center mb-20 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              What you get
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight">
              A complete outbound engine,<br className="hidden md:block" /> not just another tool
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${(i % 3) + 1} card card-hover p-7 group`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#737373] group-hover:text-white group-hover:bg-white/[0.07] transition-all duration-200 mb-5">
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

      {/* ── Comparison Table ── */}
      <ComparisonTable />

      {/* ── Case Studies ── */}
      <CaseStudies />

      {/* ── ROI Calculator ── */}
      <ROICalculator />

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 md:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl px-6" ref={revealRef}>
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              Common questions
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-700 text-white">
              Everything you want to know
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
