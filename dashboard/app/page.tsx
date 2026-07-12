"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("revealed");
          }
        });
      },
      { threshold: 0.12 }
    );
    const items = el.querySelectorAll(".reveal");
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: "Deep Website Audit",
    description: "30+ checks across SEO, performance, security, and tech stack. Every lead gets scored before you spend a second on them.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: "AI Pitch Generation",
    description: "Gemini writes cold emails that reference specific issues on the prospect's site. Not templates. Actual context.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.86 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/>
      </svg>
    ),
    title: "Autonomous Outreach",
    description: "Cold email with day 3 follow-up and day 7 breakup sequence. Telegram agent that holds real conversations. Runs 24/7 without you.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Smart Inbox",
    description: "When a prospect replies, AI classifies the intent and drafts a contextual response. You review once and send.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
    title: "CRM Pipeline",
    description: "Kanban board from discovery to closed. Drag cards between stages. Every deal tracked in one place.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "BYOK Security",
    description: "Your API keys, your data. Knight uses Cohere, Gemini, and OpenRouter — all with generous free tiers. Costs you near zero.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try every feature with no commitment.",
    features: [
      "50 leads per month",
      "50 emails per month",
      "Basic website audit",
      "CRM dashboard",
    ],
    cta: "Get started",
    href: "/auth/signup",
    highlighted: false,
    badge: null,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For freelancers scaling their outreach.",
    features: [
      "20 leads per day",
      "Full 30-point audit",
      "30 emails per day",
      "AI pitch generation",
      "CRM pipeline",
      "Email domain setup",
    ],
    cta: "Start Starter",
    href: "/auth/signup?plan=starter",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    description: "For agencies running serious outreach.",
    features: [
      "100 leads per day",
      "200 emails per day",
      "Telegram AI agent",
      "Drip sequences",
      "Smart inbox",
      "Full CRM + analytics",
    ],
    cta: "Start Pro",
    href: "/auth/signup?plan=pro",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Agency",
    price: "$299",
    period: "/month",
    description: "For teams with no limits.",
    features: [
      "Unlimited leads",
      "Unlimited emails",
      "Everything in Pro",
      "White-label dashboard",
      "Custom org branding",
      "Priority support",
    ],
    cta: "Start Agency",
    href: "/auth/signup?plan=agency",
    highlighted: false,
    badge: null,
  },
];

const faqs = [
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

const steps = [
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
      <div className="pb-5 text-sm text-[#737373] leading-relaxed pr-8">
        {a}
      </div>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const revealRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-40 md:pt-44 md:pb-56">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-60" />
        {/* Radial glow */}
        <div className="absolute inset-0 hero-vignette" />
        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
          {/* Brand */}
          <h1
            className="font-display font-800 text-6xl md:text-7xl lg:text-8xl text-white tracking-tight mb-6 animate-fade-up"
          >
            Knight
          </h1>

          {/* Tagline */}
          <p className="text-sm font-mono text-[#525252] uppercase tracking-widest mb-10 animate-fade-up animate-delay-100">
            AI-powered B2B sales automation
          </p>

          {/* Headline */}
          <h2
            className="font-display font-800 text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight mb-8 animate-fade-up animate-delay-200"
            style={{ animationFillMode: "both" }}
          >
            Your AI sales rep
            <br />
            <span className="text-[#525252]">works 24/7.</span>
          </h2>

          {/* Sub */}
          <p
            className="text-base md:text-lg text-[#737373] leading-relaxed max-w-xl mb-10 animate-fade-up animate-delay-300"
            style={{ animationFillMode: "both" }}
          >
            Knight finds businesses that need your service, audits their website,
            writes a personalized pitch, and sends it — automatically.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up animate-delay-400"
            style={{ animationFillMode: "both" }}
          >
            <Link href="/auth/signup" className="btn-primary px-7 py-3 text-sm font-semibold">
              Start free — no card required
            </Link>
            <Link href="#how-it-works" className="btn-ghost px-7 py-3 text-sm">
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <p
            className="mt-8 text-xs text-[#3a3a3a] animate-fade-up animate-delay-500"
            style={{ animationFillMode: "both" }}
          >
            Free tier includes 50 leads and 50 emails per month
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/[0.05] bg-[#0f0f0f]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "30+", label: "Audit checks per site" },
              { value: "24/7", label: "Runs without you" },
              { value: "2 min", label: "Setup time" },
            ].map((stat) => (
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

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 md:py-36 border-t border-white/[0.04] bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6" ref={revealRef}>
          <div className="text-center mb-20 reveal">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
              One client pays for Knight
            </h2>
            <p className="text-sm text-[#525252]">
              Cancel anytime. No lock-in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`reveal reveal-delay-${i + 1} relative rounded-xl flex flex-col p-7 ${
                  plan.highlighted
                    ? "bg-white text-black"
                    : "card"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#080808] border border-white/[0.08] rounded-full px-3 py-0.5 text-[10px] font-mono text-[#a3a3a3] uppercase tracking-widest whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className={`font-display text-lg font-700 mb-1 ${plan.highlighted ? "text-black" : "text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-4 ${plan.highlighted ? "text-black/50" : "text-[#3a3a3a]"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-700 ${plan.highlighted ? "text-black" : "text-white"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs ${plan.highlighted ? "text-black/40" : "text-[#3a3a3a]"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-black/40" : "text-[#3a3a3a]"}`}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className={plan.highlighted ? "text-black/80" : "text-[#737373]"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center rounded-lg py-2.5 text-sm font-medium transition-all ${
                    plan.highlighted
                      ? "bg-black text-white hover:bg-[#1a1a1a]"
                      : "border border-white/[0.08] text-[#a3a3a3] hover:text-white hover:bg-white/[0.04] hover:border-white/[0.14]"
                  }`}
                >
                  {plan.cta}
                </Link>
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
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 md:py-36 border-t border-white/[0.04] bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-6 text-center" ref={revealRef}>
          <div className="reveal">
            <h2 className="font-display text-4xl md:text-6xl font-700 text-white leading-tight mb-6">
              Stop doing sales
              <br />
              <span className="text-[#3a3a3a]">manually.</span>
            </h2>
            <p className="text-sm text-[#525252] mb-10 max-w-md mx-auto">
              Set it up in two minutes. Knight finds your first lead before you finish your coffee.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary px-8 py-3.5 text-sm font-semibold"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
