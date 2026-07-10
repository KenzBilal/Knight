"use client";

import Link from "next/link";

const features = [
  {
    title: "Deep website audit",
    description: "30+ checks: SEO, performance, security, tech stack, accessibility. Know exactly what's broken before you pitch.",
    icon: "🔍",
  },
  {
    title: "AI pitch generation",
    description: "Gemini writes personalized cold emails referencing specific issues on their site. Not generic templates.",
    icon: "✍️",
  },
  {
    title: "Autonomous outreach",
    description: "Cold email + Telegram, with drip sequences (Day 3 bump, Day 7 breakup). Runs 24/7.",
    icon: "🚀",
  },
  {
    title: "Smart inbox",
    description: "AI drafts contextual replies to interested prospects. You review and send.",
    icon: "💬",
  },
  {
    title: "CRM pipeline",
    description: "Kanban board from Discovery → Audit → Pitch → Sent → Replied → Closed. Full visibility.",
    icon: "📊",
  },
  {
    title: "Telegram agent",
    description: "AI sales conversations via Telegram DMs. Handles objections, books meetings, qualifies leads.",
    icon: "🤖",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try Knight with no commitment.",
    features: ["5 leads/day", "Basic audit (10 checks)", "Dashboard access"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    description: "For freelancers getting started.",
    features: ["20 leads/day", "Full audit (30+ checks)", "30 emails/day", "AI pitch generation", "CRM pipeline"],
    cta: "Start Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/ month",
    description: "For agencies scaling outreach.",
    features: [
      "100 leads/day",
      "200 emails/day",
      "Telegram agent",
      "Drip sequences",
      "Smart inbox",
      "Full CRM",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$299",
    period: "/ month",
    description: "For teams and white-label.",
    features: [
      "Unlimited leads",
      "Unlimited emails",
      "Telegram + white-label",
      "Team accounts",
      "API access",
      "Priority support",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Do I need to provide my own API keys?",
    a: "Yes. Knight uses your own Cohere, Gemini, and OpenRouter keys (all have free tiers). This keeps costs near zero and gives you full control.",
  },
  {
    q: "Does the Telegram agent work automatically?",
    a: "Yes. Once connected, it runs 24/7 — finds leads in groups, sends personalized pitches, handles replies, and runs drip sequences. You just approve deals.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no lock-in. Cancel from your dashboard and you keep access until the end of your billing period.",
  },
  {
    q: "How does the website audit work?",
    a: "Knight runs Puppeteer to scrape the target site, checks 30+ factors (SEO, performance, security, tech stack), and generates a score. Lower score = hotter lead.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. 5 leads/day, basic audit, and dashboard access. No credit card required.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-paper-100">Knight</Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Pricing</a>
            <Link href="/about" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-32 md:pt-40 md:pb-48">
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-4xl w-full px-6 flex flex-col items-center text-center z-10">
          <div className="rounded-full bg-flash-500/10 border border-flash-500/20 px-4 py-1.5 text-xs font-mono text-flash-500 mb-8">
            AI-powered sales automation
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight text-paper-100 leading-[1.05] mb-8 text-balance">
            Your AI sales rep<br />works 24/7.
          </h1>
          <p className="text-lg md:text-xl text-paper-300 leading-relaxed mb-10 max-w-2xl text-balance">
            Knight finds businesses that need your service, audits their website, writes a personalized pitch, and sends it — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="rounded-lg bg-flash-500 text-ink-950 font-medium px-8 py-3.5 text-base hover:bg-flash-400 transition-colors">
              Start free — no card required
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-line">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-flash-500 font-mono mb-4 text-center">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">Three steps to automated outreach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tell Knight who to find", desc: "\"Plumbers in Austin who need a website\" — type your niche and location." },
              { step: "2", title: "It discovers & audits", desc: "Google Maps scraping + 30-point website audit. Scores each lead on need." },
              { step: "3", title: "It writes & sends", desc: "AI-generated personalized cold emails referencing their specific issues." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-flash-500/10 border border-flash-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-flash-500 font-display text-xl">{s.step}</span>
                </div>
                <h3 className="font-display text-xl text-paper-100 mb-2">{s.title}</h3>
                <p className="text-sm text-paper-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-line bg-ink-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-flash-500 font-mono mb-4 text-center">Features</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">Everything you need to close deals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-ink-950 p-7 hover:border-flash-500/30 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-lg text-paper-100 mb-2">{f.title}</h3>
                <p className="text-sm text-paper-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-line">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-flash-500 font-mono mb-4 text-center">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">One client pays for Knight</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 flex flex-col ${
                  plan.highlighted
                    ? "border-flash-500/60 bg-ink-900 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]"
                    : "border-line bg-ink-950"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-mono text-flash-500 mb-3">MOST POPULAR</span>
                )}
                <h3 className="font-display text-xl text-paper-100">{plan.name}</h3>
                <p className="text-sm text-paper-400 mt-1 mb-5">{plan.description}</p>
                <div className="mb-5">
                  <span className="font-display text-3xl text-paper-100">{plan.price}</span>
                  <span className="text-sm text-paper-400 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-paper-300">
                      <span className="text-flash-500 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Agency" ? "/auth/signup" : "/auth/signup"}
                  className={`block text-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-flash-500 text-ink-950 hover:bg-flash-400"
                      : "border border-line text-paper-300 hover:bg-ink-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-line bg-ink-900/50">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-flash-500 font-mono mb-4 text-center">FAQ</p>
          <h2 className="font-display text-3xl text-paper-100 mb-12 text-center">Questions, answered</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-line bg-ink-950 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-paper-100 hover:text-flash-500 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-paper-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-paper-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-line">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-paper-100 mb-6 text-balance">
            Ready to stop doing sales manually?
          </h2>
          <p className="text-lg text-paper-300 mb-10">
            Start free. No credit card required. Set up in 2 minutes.
          </p>
          <Link href="/auth/signup" className="inline-block rounded-lg bg-flash-500 text-ink-950 font-medium px-8 py-3.5 text-base hover:bg-flash-400 transition-colors">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="font-display text-sm text-paper-400">Knight</span>
              <Link href="/about" className="text-xs text-paper-400 hover:text-paper-200">About</Link>
              <Link href="/contact" className="text-xs text-paper-400 hover:text-paper-200">Contact</Link>
              <Link href="/privacy" className="text-xs text-paper-400 hover:text-paper-200">Privacy</Link>
              <Link href="/terms" className="text-xs text-paper-400 hover:text-paper-200">Terms</Link>
              <Link href="/refund" className="text-xs text-paper-400 hover:text-paper-200">Refund</Link>
            </div>
            <span className="text-xs text-paper-400">© {new Date().getFullYear()} Knight. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
