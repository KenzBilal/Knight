"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  { title: "Deep website audit", description: "30+ checks: SEO, performance, security, tech stack. Know exactly what's broken before you pitch.", icon: "🔍" },
  { title: "AI pitch generation", description: "Gemini writes personalized cold emails referencing specific issues on their site.", icon: "✍️" },
  { title: "Autonomous outreach", description: "Cold email + Telegram, with drip sequences (Day 3 bump, Day 7 breakup). Runs 24/7.", icon: "🚀" },
  { title: "Smart inbox", description: "AI drafts contextual replies to interested prospects. You review and send.", icon: "💬" },
  { title: "CRM pipeline", description: "Kanban board from Discovery to Closed. Full visibility into every deal.", icon: "📊" },
  { title: "Telegram agent", description: "AI sales conversations via Telegram DMs. Handles objections, books meetings.", icon: "🤖" },
];

const plans = [
  { name: "Free", price: "$0", period: "forever", description: "Try Knight with no commitment.", features: ["50 leads/month", "50 emails/month", "Basic audit", "Dashboard"], cta: "Start free", highlighted: false },
  { name: "Starter", price: "$49", period: "/month", description: "For freelancers getting started.", features: ["20 leads/day", "Full audit (30+ checks)", "30 emails/day", "AI pitch generation", "CRM pipeline"], cta: "Get started", highlighted: false },
  { name: "Pro", price: "$149", period: "/month", description: "For agencies scaling outreach.", features: ["100 leads/day", "200 emails/day", "Telegram agent", "Drip sequences", "Smart inbox", "Full CRM"], cta: "Get Pro", highlighted: true },
];

const faqs = [
  { q: "Do I need my own API keys?", a: "Yes. Knight uses your own Cohere, Gemini, and OpenRouter keys (all have free tiers). This keeps costs near zero and gives you full control." },
  { q: "Does the Telegram agent work automatically?", a: "Yes. Once connected, it runs 24/7 — finds leads, sends personalized pitches, handles replies, and runs drip sequences." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel from your dashboard and keep access until the end of your billing period." },
  { q: "How does the website audit work?", a: "Knight scrapes the target site, checks 30+ factors (SEO, performance, security, tech stack), and generates a score. Lower score = hotter lead." },
  { q: "Is there a free tier?", a: "Yes. 50 leads/month, 50 emails/month, basic audit, and dashboard access. No credit card required." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-32 md:pt-40 md:pb-48">
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-4xl w-full px-6 flex flex-col items-center text-center z-10">
          <div className="rounded-full bg-neutral-900 border border-neutral-800 px-4 py-1.5 text-xs font-mono text-neutral-400 mb-8">
            AI-powered sales automation
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight text-paper-100 leading-[1.05] mb-8 text-balance">
            Your AI sales rep<br />works 24/7.
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl text-balance">
            Knight finds businesses that need your service, audits their website, writes a personalized pitch, and sends it — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-8 py-3.5 text-base hover:bg-paper-200 transition-all active:scale-[0.98]">
              Start free — no card required
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono mb-4 text-center">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">Three steps to automated outreach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tell Knight who to find", desc: "Type your niche and location — \"Plumbers in Austin who need a website\"." },
              { step: "2", title: "It discovers & audits", desc: "Google Maps scraping + 30-point website audit. Scores each lead on need." },
              { step: "3", title: "It writes & sends", desc: "AI-generated personalized cold emails referencing their specific issues." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-5">
                  <span className="text-paper-100 font-display text-xl">{s.step}</span>
                </div>
                <h3 className="font-display text-xl text-paper-100 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono mb-4 text-center">Features</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">Everything you need to close deals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7 hover:border-neutral-700 transition-colors grain-card">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-lg text-paper-100 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-neutral-800">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono mb-4 text-center">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper-100 mb-16 text-center">One client pays for Knight</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-xl border p-7 flex flex-col ${plan.highlighted ? "border-neutral-600 bg-neutral-900" : "border-neutral-800 bg-neutral-900/50"}`}>
                {plan.highlighted && <span className="text-xs font-mono text-neutral-400 mb-3">MOST POPULAR</span>}
                <h3 className="font-display text-xl text-paper-100">{plan.name}</h3>
                <p className="text-sm text-neutral-500 mt-1 mb-5">{plan.description}</p>
                <div className="mb-5">
                  <span className="font-display text-3xl text-paper-100">{plan.price}</span>
                  <span className="text-sm text-neutral-500 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                      <span className="text-paper-100 mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center rounded-lg py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${plan.highlighted ? "bg-paper-100 text-neutral-950 hover:bg-paper-200" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono mb-4 text-center">FAQ</p>
          <h2 className="font-display text-3xl text-paper-100 mb-12 text-center">Questions, answered</h2>
          <div className="space-y-3">
            {faqs.map(faq => (
              <details key={faq.q} className="group rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-paper-100 hover:text-neutral-300 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-neutral-500 group-open:rotate-180 transition-transform">&darr;</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-neutral-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-neutral-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-paper-100 mb-6 text-balance">
            Ready to stop doing sales manually?
          </h2>
          <p className="text-lg text-neutral-400 mb-10">
            Start free. No credit card required. Set up in 2 minutes.
          </p>
          <Link href="/auth/signup" className="inline-block rounded-lg bg-paper-100 text-neutral-950 font-medium px-8 py-3.5 text-base hover:bg-paper-200 transition-all active:scale-[0.98]">
            Create your free account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
