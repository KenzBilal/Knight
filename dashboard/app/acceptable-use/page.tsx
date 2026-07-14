import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — Knight",
  description: "Rules governing the acceptable use of Knight's platform and services.",
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Acceptable Use Policy</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <p>This Acceptable Use Policy (&quot;AUP&quot;) governs your use of Knight&apos;s platform, APIs, and services. By using Knight, you agree to abide by this policy. Violations may result in suspension or termination of your account without refund.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-6">Permitted uses</h2>
            <p className="mb-4">Knight is designed for professional B2B lead generation and sales outreach. Permitted uses include:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Finding and qualifying potential business clients in your target market</li>
              <li>Sending personalized, relevant outreach to business owners and decision-makers</li>
              <li>Managing your sales pipeline and follow-up sequences</li>
              <li>Analyzing website quality and opportunities for web agencies and freelancers</li>
              <li>Automating email sequences for legitimate B2B sales purposes</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-6">Prohibited uses</h2>
            <p className="mb-6">The following uses are strictly prohibited:</p>
            <div className="space-y-4">
              {[
                {
                  title: "Spam and unsolicited mass messaging",
                  desc: "Sending identical or substantially similar messages to large numbers of recipients without a legitimate business relationship. All outreach must comply with CAN-SPAM, GDPR, CASL, and applicable anti-spam laws.",
                },
                {
                  title: "Fraud, deception, and impersonation",
                  desc: "Misrepresenting your identity, company, or offerings. Using Knight to conduct phishing attacks, impersonate other businesses, or mislead recipients about the nature of your products or services.",
                },
                {
                  title: "Illegal activity",
                  desc: "Using Knight for any purpose that violates applicable local, national, or international law. This includes unlicensed financial advice, sale of illegal goods or services, and money laundering.",
                },
                {
                  title: "Harassment and threatening communications",
                  desc: "Sending communications that threaten, intimidate, bully, or harass individuals. This includes sending follow-up sequences after an explicit opt-out request.",
                },
                {
                  title: "Data scraping beyond intended use",
                  desc: "Using Knight's capabilities to scrape data for sale to third parties, to build competing products, or to aggregate data beyond what is needed for your own sales outreach.",
                },
                {
                  title: "Security attacks",
                  desc: "Attempting to probe, scan, or test the vulnerability of Knight's systems. Attempting to gain unauthorized access to other users' data or infrastructure.",
                },
                {
                  title: "Abuse of AI capabilities",
                  desc: "Using Knight's AI features to generate harmful, defamatory, discriminatory, or deceptive content. Attempting to circumvent AI safety measures or use AI for manipulation at scale.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-5">
                  <h3 className="font-display text-sm text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#525252]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Your compliance responsibility</h2>
            <p className="mb-4">You are solely responsible for ensuring your use of Knight complies with all applicable laws and regulations, including:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>CAN-SPAM Act (United States)</li>
              <li>GDPR (European Union)</li>
              <li>CASL (Canada)</li>
              <li>Any other anti-spam, privacy, or marketing laws in your jurisdiction</li>
            </ul>
            <p className="mt-4">Knight provides the tools. You are responsible for how you use them.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Enforcement</h2>
            <p className="mb-4">Knight reserves the right to investigate suspected violations of this policy. If we determine that a violation has occurred, we may:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Immediately suspend or terminate your account</li>
              <li>Remove content or campaigns in violation</li>
              <li>Report illegal activity to law enforcement</li>
              <li>Pursue legal action where appropriate</li>
            </ul>
            <p className="mt-4">We will use reasonable discretion in enforcing this policy, but egregious violations will result in immediate account termination without refund.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Reporting violations</h2>
            <p>If you observe use of Knight that violates this policy, please report it to <a href="mailto:abuse@knight.app" className="text-white hover:underline">abuse@knight.app</a>. We investigate all reports seriously.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:legal@knight.app" className="text-white hover:underline">legal@knight.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
