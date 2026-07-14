import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Trust Center — Knight",
  description:
    "Transparency is the foundation of trust. Learn how Knight operates, protects your data, and keeps its infrastructure reliable.",
};

const dataHandlingPrinciples = [
  {
    title: "Data Minimization",
    description:
      "We collect only what is strictly necessary to deliver Knight's functionality. No excess data is ingested, stored, or processed.",
  },
  {
    title: "Purpose Limitation",
    description:
      "Data collected for one purpose is never repurposed without explicit consent. Every data flow has a documented, bounded reason.",
  },
  {
    title: "Storage Security",
    description:
      "All data is encrypted at rest using AES-256 and in transit via TLS 1.3. Database access is scoped, audited, and rotated regularly.",
  },
  {
    title: "Transparent Processing",
    description:
      "We document what we process, why we process it, and how long we retain it. No hidden pipelines. No silent enrichment.",
  },
  {
    title: "User Control",
    description:
      "You can export, correct, or delete your data at any time from your account settings. Requests are fulfilled within 72 hours.",
  },
  {
    title: "No Third-Party Sale",
    description:
      "Your data is never sold, rented, or traded to third parties. Period. We are not in the business of monetizing your information.",
  },
];

const securityPractices = [
  "SOC 2 Type II audit in progress",
  "End-to-end TLS 1.3 encryption for all data in transit",
  "AES-256 encryption for all data at rest",
  "Role-based access control across all internal systems",
  "Multi-factor authentication enforced for all staff accounts",
  "Automated dependency vulnerability scanning on every deploy",
  "Secrets management via environment-isolated vaults",
  "Regular third-party penetration testing",
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-white/[0.06] bg-white/[0.03] rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
              <span className="text-xs text-[#a3a3a3] font-medium tracking-wide uppercase">
                Trust Center
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
              Knight Trust Center
            </h1>
            <p className="text-lg text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed">
              Transparency is the foundation of trust. Here&apos;s everything
              you need to know about how Knight operates, protects your data,
              and keeps its systems reliable.
            </p>
          </div>
        </section>

        {/* Platform Status */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block animate-pulse" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    All Systems Operational
                  </p>
                  <p className="text-[#525252] text-sm mt-0.5">
                    Real-time status monitoring coming soon.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <a
                  href="#"
                  className="text-sm text-[#a3a3a3] hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
                >
                  View Status Page →
                </a>
                <span className="text-xs text-[#525252]">
                  Live incident tracking available soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Reliability */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-white mb-6">
              Service Reliability
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-4xl font-display font-semibold text-white mb-1">
                  99.9%
                </p>
                <p className="text-sm text-[#a3a3a3]">Target uptime SLA</p>
              </div>
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-4xl font-display font-semibold text-white mb-1">
                  30d
                </p>
                <p className="text-sm text-[#a3a3a3]">
                  Rolling uptime window
                  <span className="block text-[#525252] text-xs mt-1">
                    Live data available soon
                  </span>
                </p>
              </div>
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-4xl font-display font-semibold text-white mb-1">
                  48h
                </p>
                <p className="text-sm text-[#a3a3a3]">
                  Advance notice for maintenance windows
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure Summary */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-white mb-2">
              Infrastructure
            </h2>
            <p className="text-[#a3a3a3] mb-6 text-sm">
              Built on enterprise-grade, globally distributed infrastructure
              with no single points of failure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Edge Network",
                  value: "Vercel Edge Network",
                  detail:
                    "Globally distributed CDN with automatic routing to the nearest region.",
                },
                {
                  label: "Database",
                  value: "Supabase PostgreSQL",
                  detail:
                    "Managed Postgres with built-in replication, backups, and row-level security.",
                },
                {
                  label: "Distribution",
                  value: "Globally Distributed",
                  detail:
                    "Infrastructure spans multiple regions to minimize latency for all users.",
                },
                {
                  label: "Resilience",
                  value: "Automated Failover",
                  detail:
                    "Traffic is automatically rerouted within seconds of any regional degradation.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6"
                >
                  <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-white font-semibold mb-2">{item.value}</p>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Practices */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white mb-1">
                    Security Practices
                  </h2>
                  <p className="text-[#a3a3a3] text-sm">
                    Security is engineered in, not bolted on.
                  </p>
                </div>
                <Link
                  href="/security"
                  className="text-sm text-white border border-white/[0.09] rounded-lg px-4 py-2 hover:bg-white/[0.04] transition-colors whitespace-nowrap self-start"
                >
                  Full Security Overview →
                </Link>
              </div>
              <ul className="space-y-3">
                {securityPractices.map((practice) => (
                  <li key={practice} className="flex items-start gap-3">
                    <span className="mt-1 w-4 h-4 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 block" />
                    </span>
                    <span className="text-[#a3a3a3] text-sm leading-relaxed">
                      {practice}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy Commitments */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white mb-1">
                    Privacy Commitments
                  </h2>
                  <p className="text-[#a3a3a3] text-sm">
                    Your data belongs to you. We are stewards, not owners.
                  </p>
                </div>
                <Link
                  href="/privacy"
                  className="text-sm text-white border border-white/[0.09] rounded-lg px-4 py-2 hover:bg-white/[0.04] transition-colors whitespace-nowrap self-start"
                >
                  Read Privacy Policy →
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#a3a3a3] text-lg mt-0.5">🇪🇺</span>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">
                      GDPR-Conscious Design
                    </p>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed">
                      Knight is designed with GDPR principles as a baseline, not
                      an afterthought. Data subject rights are built into the
                      product, not handled manually.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#a3a3a3] text-lg mt-0.5">🚫</span>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">
                      No Data Selling
                    </p>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed">
                      We do not sell, license, or trade your data with any third
                      party for any purpose, ever. Our business model is
                      subscriptions, not your information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#a3a3a3] text-lg mt-0.5">🔧</span>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">
                      User-Controlled Data
                    </p>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed">
                      Export your data, update it, or request deletion at any
                      time. You have full control over what Knight stores about
                      you and your organization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Handling Principles */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-white mb-2">
              Data Handling Principles
            </h2>
            <p className="text-[#a3a3a3] mb-6 text-sm">
              Six principles that govern every decision we make about your data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataHandlingPrinciples.map((principle) => (
                <div
                  key={principle.title}
                  className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6"
                >
                  <h3 className="text-white font-semibold mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Maintenance Policy */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
              <h2 className="font-display text-2xl font-semibold text-white mb-1">
                Maintenance Policy
              </h2>
              <p className="text-[#a3a3a3] text-sm mb-6">
                We take maintenance seriously so you don&apos;t have to think
                about it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-white font-semibold text-sm mb-1">
                    Scheduled Windows
                  </p>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    All planned maintenance is scheduled during the
                    lowest-traffic windows — typically between 02:00–05:00 UTC
                    on weekdays.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-white font-semibold text-sm mb-1">
                    48-Hour Advance Notice
                  </p>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    Non-emergency maintenance is communicated at least 48 hours
                    in advance via in-app banner and email notification.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-white font-semibold text-sm mb-1">
                    Zero-Downtime Deploys
                  </p>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed">
                    Application deployments use blue-green and rolling
                    strategies. Most updates reach production with no
                    user-visible interruption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full border border-white/[0.09] bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white mb-2">
                Responsible Disclosure
              </h2>
              <p className="text-[#a3a3a3] text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                Found a vulnerability? We take security reports seriously and
                respond within 24 hours. Please disclose responsibly — do not
                publish or exploit findings before we&apos;ve had a chance to
                address them.
              </p>
              <a
                href="mailto:security@knight.app"
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Report a Vulnerability
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <p className="text-[#525252] text-xs mt-4">
                security@knight.app · PGP key available on request
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
