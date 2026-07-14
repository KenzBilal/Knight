import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Knight",
  description: "We built the sales engine we always wished we had. Learn about Knight's mission, values, and the team behind the product.",
};

const values = [
  {
    title: "Radical Transparency",
    description: "We show you exactly what Knight is doing and why. No black boxes. Every action is logged, reviewable, and fully under your control.",
  },
  {
    title: "Customer Obsession",
    description: "Every feature in Knight exists because a real customer asked for it. We listen before we build, and we ship what actually moves the needle.",
  },
  {
    title: "Privacy by Default",
    description: "We collect the minimum data needed to run the product. We never sell user data, never share it without consent, and make deletion simple.",
  },
  {
    title: "Continuous Improvement",
    description: "Knight ships weekly. Every release makes the product faster, smarter, or more reliable. We treat the product as permanently in progress.",
  },
];

const principles = [
  {
    title: "Automation that respects people",
    description: "Knight automates the repetitive work — not the human judgment. You review, you decide, you build the relationship. Knight just removes the friction.",
  },
  {
    title: "AI that augments, not replaces",
    description: "We use AI as a tool to give you leverage — better research, better writing, better prioritization. The strategy and the relationships remain entirely yours.",
  },
  {
    title: "Software that earns your trust",
    description: "Trust isn't claimed, it's built through reliability, transparency, and doing what we say. Every commit we ship is another step toward being software you depend on.",
  },
];

const milestones = [
  { date: "Q1 2025", event: "Knight founded with a single mission: eliminate busywork from B2B sales" },
  { date: "Q2 2025", event: "First beta users onboarded — 50 agencies and freelancers testing the core loop" },
  { date: "Q3 2025", event: "Public launch — email outreach, website auditing, and Telegram agent shipped" },
  { date: "Q4 2025", event: "Inbox management, CRM pipeline, and smart reply drafting added" },
  { date: "Q1 2026", event: "Multi-channel expansion: Telegram outreach and direct message sequences" },
  { date: "Q2 2026", event: "Enterprise tier development begins — team accounts, custom MSAs, dedicated support" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-6">About Knight</p>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-8 max-w-3xl leading-tight">
              We built the sales engine we always wished we had.
            </h1>
            <p className="text-xl text-[#525252] max-w-2xl leading-relaxed">
              Knight is an AI-powered B2B sales agent that handles prospecting, research, pitching, and follow-up — so you can focus entirely on closing.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-6">Mission</p>
              <p className="text-2xl md:text-3xl text-white leading-relaxed font-display">
                Our mission is to eliminate busywork from B2B sales. Knight handles the prospecting, the research, the pitching, and the follow-up — so you can focus entirely on closing.
              </p>
            </div>
          </div>
        </section>

        {/* Why Knight Exists */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-6">Why Knight Exists</p>
                <h2 className="font-display text-3xl text-white mb-6">The problem we set out to solve</h2>
                <div className="space-y-4 text-[#525252] leading-relaxed">
                  <p>
                    Before Knight, winning new clients as a freelancer or agency meant hours of manual research — scrolling through Google Maps, manually checking competitor websites, copy-pasting email templates that felt generic even to us.
                  </p>
                  <p>
                    The alternative was hiring a sales agency that charged thousands per month for leads that barely converted. Neither was acceptable.
                  </p>
                  <p>
                    Knight exists because the tools to do this well — AI for research, automation for outreach, data for qualification — finally exist at a price that makes sense for independent operators and growing agencies.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { stat: "2 min", label: "From signup to first campaign running" },
                  { stat: "30+", label: "Signals checked per lead automatically" },
                  { stat: "24/7", label: "Pipeline generated while you focus on clients" },
                  { stat: "0", label: "Sales reps hired to scale your outreach" },
                ].map((item) => (
                  <div key={item.stat} className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-4 flex items-center gap-6">
                    <span className="font-display text-3xl text-white w-16 shrink-0">{item.stat}</span>
                    <span className="text-sm text-[#525252]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Values</p>
            <h2 className="font-display text-3xl text-white mb-12">What we believe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                  <h3 className="font-display text-lg text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-[#525252] leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Philosophy */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Product Philosophy</p>
            <h2 className="font-display text-3xl text-white mb-12">How we think about the product</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {principles.map((p) => (
                <div key={p.title} className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                  <h3 className="font-display text-base text-white mb-3">{p.title}</h3>
                  <p className="text-sm text-[#525252] leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Team</p>
            <h2 className="font-display text-3xl text-white mb-4">The people behind Knight</h2>
            <p className="text-[#525252] mb-12 max-w-2xl">We are a small team of builders obsessed with making B2B sales less painful. We use Knight ourselves, which makes every improvement personal.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { role: "Founder & CEO", note: "Product vision & strategy" },
                { role: "Lead Engineer", note: "Infrastructure & AI systems" },
                { role: "Head of Design", note: "UX & design systems" },
              ].map((member) => (
                <div key={member.role} className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-[#161616] border border-white/[0.06] mb-4" />
                  <p className="font-display text-white text-sm mb-1">{member.role}</p>
                  <p className="text-xs text-[#3a3a3a]">{member.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Timeline</p>
            <h2 className="font-display text-3xl text-white mb-12">How we got here</h2>
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={m.date} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-white/20 group-first:bg-white mt-1.5 shrink-0" />
                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-wider mb-1">{m.date}</p>
                    <p className="text-sm text-[#a3a3a3] leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="font-display text-4xl text-white mb-4">Ready to see Knight in action?</h2>
            <p className="text-[#525252] mb-8">Start free, no credit card required. Your first leads in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/auth/signup" className="bg-white text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                Start for free
              </a>
              <a href="/contact" className="border border-white/[0.08] text-[#a3a3a3] px-6 py-3 rounded-lg text-sm hover:border-white/20 hover:text-white transition-colors">
                Talk to us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
