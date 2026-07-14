import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Enterprise | Knight",
  description:
    "Knight for Enterprise — built for teams that need power, control, and reliability at scale. Custom contracts, dedicated support, and enterprise-grade infrastructure.",
};

const features = [
  {
    title: "Organization Management",
    description:
      "Centralize multiple teams, workspaces, and campaigns under a single organizational umbrella. Full visibility across every pipeline, rep, and account in one place.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L2 7v11h5v-5h6v5h5V7L10 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Team Permissions & Roles",
    description:
      "Granular role-based access control so every team member sees exactly what they need. Assign admins, editors, viewers, and custom roles across campaigns and data sets.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 5l1.5 1.5L19 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Custom Onboarding",
    description:
      "Dedicated implementation specialists guide your team from day one. We configure Knight to match your existing workflows, CRM structure, and sales motion.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2v4M10 14v4M2 10h4M14 10h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Dedicated Account Support",
    description:
      "Your organization gets a named account manager who understands your business. Regular check-ins, strategy sessions, and proactive health reviews keep you on track.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 5h14M3 10h10M3 15h7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Priority Assistance",
    description:
      "Enterprise customers jump to the front of every support queue. Critical issues get SLA-backed response times, escalation paths, and direct engineering access when needed.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2l2.09 6.26H18l-5 3.64 1.91 5.86L10 14l-4.91 3.76L7 11.9 2 8.26h5.91L10 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Custom Contracts & MSAs",
    description:
      "We work with your legal team on master service agreements, data processing addenda, and procurement requirements. No rigid take-it-or-leave-it terms.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="2"
          width="14"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 7h6M7 10h6M7 13h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const scaleCards = [
  {
    title: "Scalable Infrastructure",
    description:
      "Knight runs on infrastructure designed for the most demanding sales teams. Whether you're sending 10,000 or 10 million signals a month, performance stays consistent. Automatic scaling ensures zero degradation as your team grows.",
    stat: "10M+",
    statLabel: "signals processed monthly",
  },
  {
    title: "Custom Integrations",
    description:
      "Connect Knight to your existing tech stack with dedicated integration support. Salesforce, HubSpot, Outreach, Salesloft, custom CRMs — if your team uses it, we make it work. API-first architecture means anything is possible.",
    stat: "50+",
    statLabel: "native integrations",
  },
  {
    title: "Volume Pricing",
    description:
      "Enterprise pricing is structured around your actual usage and team size, not arbitrary seat tiers. Negotiate rates that reflect the full scale of your deployment and lock in multi-year terms for predictable cost planning.",
    stat: "Custom",
    statLabel: "pricing for your team",
  },
];

const trustBadges = [
  { label: "SOC 2 Type II", note: "In Progress" },
  { label: "GDPR Conscious" },
  { label: "99.9% SLA" },
  { label: "Dedicated Support" },
  { label: "Custom MSA" },
];

const faqs = [
  {
    q: "What team size is Knight Enterprise designed for?",
    a: "Knight Enterprise is built for revenue teams of 10 or more, including inside sales, outbound, and account-based marketing. We've deployed with teams of 5 and teams of 500 — the platform adapts to your headcount and structure.",
  },
  {
    q: "How does custom pricing work?",
    a: "Enterprise pricing is based on your team size, usage volume, and contract length. We don't publish enterprise rates because every deployment is different. Book a call with our sales team and we'll put together a proposal within 48 hours.",
  },
  {
    q: "What does the onboarding process look like?",
    a: "Every enterprise customer gets a dedicated implementation specialist. Onboarding typically takes 2–4 weeks depending on your CRM complexity and integration requirements. We handle configuration, data migration strategy, and initial training sessions for your team.",
  },
  {
    q: "Can Knight pass a security review?",
    a: "Yes. We're SOC 2 Type II in progress and can provide a full security questionnaire response, penetration test results, data processing agreements, and architecture documentation for your security team. Compliance reviews are a standard part of our enterprise process.",
  },
  {
    q: "Do enterprise plans include API access?",
    a: "All enterprise plans include full API access with higher rate limits and dedicated API documentation support. We can also work with your engineering team to build custom webhooks, data pipelines, and event-driven automations on top of the Knight platform.",
  },
  {
    q: "What does the 99.9% SLA guarantee cover?",
    a: "Our SLA covers platform uptime for core features including enrichment, sequencing, and CRM sync. Downtime that falls below the SLA threshold triggers service credits as outlined in your MSA. Enterprise customers also get a dedicated status page and real-time incident notifications.",
  },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] rounded-full px-4 py-1.5 text-xs text-[#a3a3a3] font-mono mb-8">
              Enterprise
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mb-6 leading-[1.05]">
              Knight for Enterprise
            </h1>
            <p className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10 leading-relaxed">
              Built for teams that need power, control, and reliability at
              scale. Enterprise-grade infrastructure with the flexibility to fit
              your exact workflow.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-white text-black font-medium text-[15px] hover:bg-white/90 transition-colors"
            >
              Talk to Sales
              <svg
                className="ml-2"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
                Everything your team needs
              </h2>
              <p className="text-[#a3a3a3] max-w-xl mx-auto">
                Knight Enterprise is engineered around the real requirements of
                modern revenue organizations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6 group hover:border-white/[0.10] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#a3a3a3] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-white font-medium text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scale Section */}
        <section className="py-20 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
                Infrastructure that scales with you
              </h2>
              <p className="text-[#a3a3a3] max-w-xl mx-auto">
                No bottlenecks. No arbitrary limits. Knight grows as fast as
                your pipeline does.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scaleCards.map((card) => (
                <div
                  key={card.title}
                  className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6 flex flex-col"
                >
                  <div className="mb-6">
                    <span className="font-display text-4xl font-semibold text-white">
                      {card.stat}
                    </span>
                    <p className="text-xs text-[#525252] mt-1 font-mono uppercase tracking-wider">
                      {card.statLabel}
                    </p>
                  </div>
                  <h3 className="font-display text-white font-medium text-lg mb-3">
                    {card.title}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-xs font-mono text-[#525252] uppercase tracking-widest mb-8">
              Enterprise-grade trust & compliance
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="border border-white/[0.08] rounded-full px-4 py-2 text-sm text-[#a3a3a3] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                  {badge.label}
                  {badge.note && (
                    <span className="text-[#525252] text-xs">({badge.note})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-t border-white/[0.05]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
                Enterprise FAQ
              </h2>
              <p className="text-[#a3a3a3]">
                Common questions from procurement, security, and sales
                leadership.
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6"
                >
                  <h3 className="font-display text-white font-medium mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-5 tracking-tight">
              Ready to deploy Knight at scale?
            </h2>
            <p className="text-[#a3a3a3] text-lg mb-10 max-w-xl mx-auto">
              Talk to our enterprise team and get a custom proposal tailored to
              your team size, workflow, and budget.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-white text-black font-medium text-[15px] hover:bg-white/90 transition-colors"
              >
                Contact Sales
                <svg
                  className="ml-2"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center border border-white/[0.08] text-[#a3a3a3] px-6 py-3 rounded-lg text-sm font-medium hover:border-white/[0.16] hover:text-white transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
