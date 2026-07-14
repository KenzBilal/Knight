import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Center — Knight",
  description: "Knight's security architecture, infrastructure, encryption standards, and responsible disclosure policy.",
};

const securityPillars = [
  {
    title: "Encryption at Rest",
    description: "All data stored in Supabase PostgreSQL is encrypted at rest using AES-256. Your credentials, API keys, and prospect data are never stored in plaintext.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
  {
    title: "Encryption in Transit",
    description: "All connections use TLS 1.3. Data transmitted between your browser, our servers, and third-party APIs is encrypted end-to-end.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Zero-Trust Architecture",
    description: "Every request is authenticated and authorized independently. No implicit trust between services — every call is verified.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    ),
  },
];

const infraFeatures = [
  { label: "Hosting", value: "Vercel Edge Network — globally distributed, DDoS-protected" },
  { label: "Database", value: "Supabase PostgreSQL — SOC 2 compliant, automated backups" },
  { label: "CDN", value: "Vercel Edge — content served from closest region to user" },
  { label: "Scaling", value: "Automatic horizontal scaling — no downtime on traffic spikes" },
  { label: "Monitoring", value: "Sentry error tracking, Vercel analytics, uptime monitoring 24/7" },
  { label: "Deployments", value: "Atomic deployments with instant rollback capability" },
];

const faqItems = [
  {
    q: "Where is my data stored?",
    a: "Your data is stored in Supabase PostgreSQL databases hosted on AWS infrastructure. Supabase is SOC 2 Type II compliant. Data residency is in the US-East region by default.",
  },
  {
    q: "Are my API keys secure?",
    a: "Your API keys (Gemini, Cohere, OpenRouter) are stored encrypted at rest and are never logged or exposed in responses. They are used only to make API calls on your behalf.",
  },
  {
    q: "How is my Telegram account protected?",
    a: "Knight uses the official MTProto protocol for Telegram. Your session credentials are encrypted and scoped only to the operations Knight needs. You can revoke access at any time from Telegram settings.",
  },
  {
    q: "Does Knight use my data to train AI models?",
    a: "No. Knight does not use your data or your prospects' data to train AI models. AI calls are made with your own API keys to providers that have their own data policies.",
  },
  {
    q: "What happens to my data when I cancel?",
    a: "When you delete your account, all personal data is removed within 30 days. Anonymized, aggregated usage statistics may be retained for platform improvement.",
  },
  {
    q: "How do I report a security vulnerability?",
    a: "Email security@knight.app with a description of the issue. We follow a 90-day responsible disclosure policy and will acknowledge your report within 48 hours.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] rounded-full px-3 py-1 mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-xs text-[#a3a3a3] font-mono">Security Center</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6 max-w-3xl">
              Security at Knight
            </h1>
            <p className="text-lg text-[#525252] max-w-2xl leading-relaxed">
              Your data is protected by enterprise-grade security at every layer. We take a defense-in-depth approach — multiple independent controls, so no single failure compromises your business.
            </p>
          </div>
        </section>

        {/* Platform Security */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Platform Security</p>
            <h2 className="font-display text-3xl text-white mb-12">Built secure from the ground up</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {securityPillars.map((item) => (
                <div key={item.title} className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-[#a3a3a3] mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-lg text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-[#525252] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Infrastructure</p>
            <h2 className="font-display text-3xl text-white mb-4">Reliable infrastructure overview</h2>
            <p className="text-[#525252] mb-12 max-w-2xl">Knight runs on best-in-class managed infrastructure, allowing us to focus on security hardening rather than server maintenance.</p>
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl overflow-hidden">
              {infraFeatures.map((item, i) => (
                <div key={item.label} className={`flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 ${i < infraFeatures.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                  <span className="text-xs font-mono text-[#3a3a3a] uppercase tracking-wider w-28 shrink-0">{item.label}</span>
                  <span className="text-sm text-[#a3a3a3]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Auth & Authorization */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-8">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Authentication</p>
                <h3 className="font-display text-2xl text-white mb-4">Identity & access</h3>
                <ul className="space-y-3">
                  {[
                    "Magic link email authentication via Supabase Auth",
                    "Session tokens with automatic expiry and rotation",
                    "Password hashing with bcrypt (cost factor 12)",
                    "Multi-factor authentication — coming Q3 2026",
                    "OAuth via Google and GitHub — planned",
                    "Brute-force protection and rate limiting on all auth endpoints",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#525252]">
                      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-8">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Authorization</p>
                <h3 className="font-display text-2xl text-white mb-4">Data isolation</h3>
                <ul className="space-y-3">
                  {[
                    "Row Level Security (RLS) enforced at the database layer",
                    "Every query is scoped to the authenticated user's ID",
                    "No user can read, write, or delete another user's data",
                    "Service role access restricted to server-side API routes only",
                    "API keys never exposed to the client or browser",
                    "Supabase policies reviewed on every schema migration",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#525252]">
                      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Backup & Monitoring */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Backup & Recovery</p>
                <h3 className="font-display text-xl text-white mb-4">Always recoverable</h3>
                <ul className="space-y-2.5 text-sm text-[#525252]">
                  <li>Daily automated database backups</li>
                  <li>Point-in-time recovery available</li>
                  <li>Recovery Point Objective (RPO): &lt;24 hours</li>
                  <li>Recovery Time Objective (RTO): &lt;4 hours</li>
                  <li>Backup encryption matching production</li>
                </ul>
              </div>
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Monitoring</p>
                <h3 className="font-display text-xl text-white mb-4">Always watching</h3>
                <ul className="space-y-2.5 text-sm text-[#525252]">
                  <li>24/7 automated infrastructure monitoring</li>
                  <li>Real-time error tracking via Sentry</li>
                  <li>Uptime monitoring with sub-minute checks</li>
                  <li>Alerting to on-call team within 5 minutes</li>
                  <li>Performance monitoring on all API routes</li>
                </ul>
              </div>
              <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Incident Response</p>
                <h3 className="font-display text-xl text-white mb-4">Clear, fast response</h3>
                <ul className="space-y-2.5 text-sm text-[#525252]">
                  <li>Defined P0–P3 incident severity tiers</li>
                  <li>P0 (critical): 1-hour response SLA</li>
                  <li>P1 (high): 4-hour response SLA</li>
                  <li>Status page updates during all incidents</li>
                  <li>Post-incident reviews for P0/P1 events</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Vulnerability Disclosure */}
        <section className="py-20 border-b border-white/[0.05]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-8 md:p-12">
              <div className="max-w-2xl">
                <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Vulnerability Disclosure</p>
                <h2 className="font-display text-3xl text-white mb-4">Responsible disclosure policy</h2>
                <p className="text-[#525252] leading-relaxed mb-6">
                  We believe in working with the security community to keep Knight safe for everyone. If you discover a security vulnerability, we want to hear from you.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Email security@knight.app with a clear description of the issue",
                    "Include steps to reproduce and potential impact",
                    "We will acknowledge your report within 48 hours",
                    "We follow a 90-day disclosure window before public disclosure",
                    "We do not pursue legal action against good-faith researchers",
                    "Credit will be given for responsibly disclosed vulnerabilities",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#525252]">
                      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:security@knight.app"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Report a vulnerability
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-display text-3xl text-white mb-12">Security questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item) => (
                <div key={item.q} className="border border-white/[0.06] bg-[#0f0f0f] rounded-2xl p-6">
                  <h3 className="font-display text-base text-white mb-3">{item.q}</h3>
                  <p className="text-sm text-[#525252] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
