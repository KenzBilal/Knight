import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — Knight",
  description: "How Knight uses cookies and similar technologies on our website and platform.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Cookie Policy</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-white mb-4">What are cookies?</h2>
            <p>Cookies are small text files that are stored on your device when you visit a website. They allow the website to remember your preferences and actions over time. Cookies can be session-based (deleted when you close your browser) or persistent (stored for a set period).</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">How we use cookies</h2>
            <p className="mb-6">Knight uses cookies to make our platform work correctly, to understand how people use our service, and to improve the experience. We do not use cookies to serve targeted advertising or sell data to third parties.</p>
            <div className="space-y-4">
              {[
                {
                  type: "Essential Cookies",
                  purpose: "These cookies are required for the platform to function. They handle authentication, session management, and security. You cannot opt out of these without losing access to the service.",
                  examples: "Supabase auth session token, CSRF protection tokens",
                },
                {
                  type: "Analytics Cookies",
                  purpose: "We use anonymized analytics to understand which features are used, how long sessions last, and where users encounter friction. This data is aggregated and never tied to individual identities.",
                  examples: "Vercel Analytics (anonymized), page view counts",
                },
                {
                  type: "Functional Cookies",
                  purpose: "These cookies remember your preferences such as sidebar state, display settings, and last-visited dashboard sections so you don't have to configure them on every visit.",
                  examples: "UI preferences, onboarding state, theme settings",
                },
              ].map((item) => (
                <div key={item.type} className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-6">
                  <h3 className="font-display text-white mb-2">{item.type}</h3>
                  <p className="text-sm text-[#525252] mb-3">{item.purpose}</p>
                  <p className="text-xs text-[#3a3a3a] font-mono">Examples: {item.examples}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Third-party cookies</h2>
            <p>Some third-party services we use may set their own cookies. These include:</p>
            <ul className="mt-4 space-y-2 list-disc list-inside ml-4">
              <li><strong className="text-[#a3a3a3]">Supabase</strong> — authentication and session management</li>
              <li><strong className="text-[#a3a3a3]">LemonSqueezy</strong> — payment processing (checkout flow only)</li>
              <li><strong className="text-[#a3a3a3]">Vercel</strong> — performance optimization and analytics</li>
            </ul>
            <p className="mt-4">We do not use Google Analytics, Facebook Pixel, or any advertising cookies.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Managing cookies</h2>
            <p className="mb-4">You can control and manage cookies in several ways:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li><strong className="text-[#a3a3a3]">Browser settings</strong> — most browsers allow you to block or delete cookies through their privacy settings</li>
              <li><strong className="text-[#a3a3a3]">Opt-out tools</strong> — some analytics providers offer opt-out browser extensions</li>
              <li><strong className="text-[#a3a3a3]">Incognito mode</strong> — session cookies are not stored between private browsing sessions</li>
            </ul>
            <p className="mt-4">Note: blocking essential cookies will prevent you from logging in or using the platform.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Changes to this policy</h2>
            <p>We may update this Cookie Policy from time to time. We will notify users of any significant changes via email or an in-app notice. Continued use of the platform after changes constitutes acceptance.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Contact</h2>
            <p>Questions about our use of cookies? Email us at <a href="mailto:privacy@knight.app" className="text-white hover:underline">privacy@knight.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
