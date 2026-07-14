import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Knight",
  description: "How Knight collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <p>Knight (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use our platform. Please read it carefully.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect the following categories of information:</p>
            <div className="space-y-4">
              {[
                { title: "Account information", desc: "Your name, email address, and password when you register. Passwords are hashed and never stored in plaintext." },
                { title: "Profile information", desc: "Your company name, website, services offered, and target market — used to personalize AI-generated outreach." },
                { title: "API keys", desc: "Keys for Gemini, Cohere, and OpenRouter that you provide. Stored encrypted, used only for API calls on your behalf." },
                { title: "Campaign and prospect data", desc: "Information about prospects you target, emails sent, replies received, and campaign performance." },
                { title: "Telegram data", desc: "If you connect a Telegram account, we store session credentials encrypted and use them only for authorized outreach actions." },
                { title: "Payment information", desc: "Payment is processed by LemonSqueezy. We do not store full card numbers. We receive transaction IDs and subscription status." },
                { title: "Usage data", desc: "Anonymized data about how you use the platform — pages visited, features used, session duration. Used to improve the product." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-1 bg-white/[0.06] rounded-full shrink-0 mt-1" />
                  <div>
                    <p className="text-[#a3a3a3] text-sm font-medium mb-1">{item.title}</p>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">2. Why We Collect It</h2>
            <p className="mb-4">We collect personal data only to:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Provide and maintain the Knight platform and its features</li>
              <li>Process payments and manage subscriptions</li>
              <li>Personalize AI-generated content based on your business profile</li>
              <li>Respond to support requests and inquiries</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Improve our products through anonymized usage analysis</li>
              <li>Send service-related emails (account changes, billing, security alerts)</li>
            </ul>
            <p className="mt-4">We do not use your data for advertising. We do not build profiles for sale to data brokers.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">3. Data Sharing</h2>
            <p className="mb-4">We share your data only with:</p>
            <ul className="space-y-3">
              {[
                { party: "Supabase", purpose: "Database hosting and authentication. SOC 2 compliant." },
                { party: "LemonSqueezy", purpose: "Payment processing and subscription management." },
                { party: "Resend", purpose: "Transactional email delivery (system notifications, not marketing)." },
                { party: "Vercel", purpose: "Web hosting and edge network infrastructure." },
                { party: "Sentry", purpose: "Error tracking and performance monitoring — no PII in error reports." },
              ].map((item) => (
                <li key={item.party} className="flex gap-3 text-sm">
                  <span className="text-[#a3a3a3] w-28 shrink-0">{item.party}</span>
                  <span>{item.purpose}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">We never sell your personal data. We never share it with advertisers.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">4. Data Retention</h2>
            <p className="mb-4">We retain your data as long as your account is active. When you delete your account:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Personal data is deleted within 30 days</li>
              <li>Campaign and prospect data is deleted immediately on request</li>
              <li>Payment records may be retained for legal and tax compliance (up to 7 years)</li>
              <li>Anonymized, aggregated usage data is retained indefinitely</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">5. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { right: "Access", desc: "Request a copy of the data we hold about you" },
                { right: "Correction", desc: "Request correction of inaccurate data" },
                { right: "Deletion", desc: "Request deletion of your personal data" },
                { right: "Portability", desc: "Receive your data in a structured, machine-readable format" },
                { right: "Restriction", desc: "Request that we limit processing of your data" },
                { right: "Objection", desc: "Object to certain types of processing" },
              ].map((item) => (
                <div key={item.right} className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-4">
                  <p className="text-[#a3a3a3] text-sm font-medium mb-1">{item.right}</p>
                  <p className="text-xs text-[#525252]">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6">To exercise any of these rights, email <a href="mailto:privacy@knight.app" className="text-white hover:underline">privacy@knight.app</a>. We will respond within 30 days.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management, and anonymized analytics cookies to understand product usage. We do not use advertising cookies. See our <a href="/cookie-policy" className="text-white hover:underline">Cookie Policy</a> for full details.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">7. Security</h2>
            <p>We implement industry-standard security measures including encryption at rest (AES-256), encryption in transit (TLS 1.3), Row Level Security at the database layer, and regular security reviews. See our <a href="/security" className="text-white hover:underline">Security Center</a> for details.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">8. Children&apos;s Privacy</h2>
            <p>Knight is not intended for anyone under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child, we will delete it immediately.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notice. Your continued use of Knight after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">10. Contact</h2>
            <p>For privacy-related questions or to exercise your rights, email <a href="mailto:privacy@knight.app" className="text-white hover:underline">privacy@knight.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
