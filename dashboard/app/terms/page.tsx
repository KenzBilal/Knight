import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Knight",
  description: "The terms governing your use of Knight's platform and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of Knight (&quot;Service&quot;), operated by Knight (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">1. Acceptance of Terms</h2>
            <p>By creating an account or using Knight in any way, you represent that you are at least 18 years old and have the legal authority to enter into these Terms. If you are using Knight on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">2. Description of Service</h2>
            <p>Knight is an AI-powered B2B sales automation platform that helps users find potential clients through website auditing, generate personalized outreach, and manage sales communication via email and Telegram. The Service includes lead discovery, website analysis, email automation, inbox management, and CRM pipeline features.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">3. Account Registration</h2>
            <p className="mb-4">To use Knight, you must create an account. You agree to:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activity under your account</li>
              <li>Not share your account with any other person</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree to use Knight only for lawful purposes and in accordance with these Terms. You agree not to use Knight:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>To send spam, unsolicited bulk messages, or communications that violate CAN-SPAM, GDPR, CASL, or similar laws</li>
              <li>To engage in fraudulent, deceptive, or misleading practices</li>
              <li>To harass, threaten, or harm any individual or business</li>
              <li>To violate any applicable law or regulation</li>
              <li>To attempt unauthorized access to our systems or another user&apos;s data</li>
              <li>In any way that could disable, damage, or impair the Service</li>
            </ul>
            <p className="mt-4">See our <a href="/acceptable-use" className="text-white hover:underline">Acceptable Use Policy</a> for full details.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">5. Subscriptions and Payment</h2>
            <p className="mb-4">Knight offers free and paid subscription plans. For paid plans:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Subscriptions are billed on a monthly or annual basis as selected</li>
              <li>Fees are charged in advance and are non-refundable except as described in our Refund Policy</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>We may change pricing with 30 days&apos; advance notice</li>
              <li>Failure to pay may result in suspension or termination of your account</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">6. Your Data and Content</h2>
            <p className="mb-4">You retain ownership of all data you submit to Knight, including prospect data, email content, and campaign materials. By using the Service, you grant us a limited, non-exclusive license to process your data solely to provide the Service to you. We will not sell, share, or use your data for any purpose beyond operating Knight. See our <a href="/privacy" className="text-white hover:underline">Privacy Policy</a> for details.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">7. AI-Generated Content</h2>
            <p>Knight uses artificial intelligence to generate email drafts, lead scores, and other content. You are solely responsible for reviewing and approving AI-generated content before use. Knight makes no warranties about the accuracy, legality, or effectiveness of AI-generated content. See our <a href="/ai-policy" className="text-white hover:underline">AI Usage Policy</a> for details.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">8. Intellectual Property</h2>
            <p>Knight and its original content, features, and functionality are the exclusive property of Knight and its licensors. Our trademarks, logos, and service marks may not be used without prior written consent. You may not copy, modify, distribute, or create derivative works of the Service without our written permission.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">9. Disclaimers</h2>
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">10. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, KNIGHT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO KNIGHT IN THE TWELVE MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">11. Termination</h2>
            <p className="mb-4">You may cancel your account at any time through your billing settings. We may suspend or terminate your account immediately if:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>You breach these Terms or our Acceptable Use Policy</li>
              <li>We are required to do so by law</li>
              <li>Your use of the Service poses a risk to other users or the platform</li>
            </ul>
            <p className="mt-4">Upon termination, your right to use the Service ceases immediately. We will delete your data in accordance with our Privacy Policy.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">12. Governing Law</h2>
            <p>These Terms are governed by the laws of the applicable jurisdiction without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in any court of competent jurisdiction.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or in-app notice at least 14 days before the changes take effect. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">14. Contact</h2>
            <p>Questions about these Terms? Email <a href="mailto:legal@knight.app" className="text-white hover:underline">legal@knight.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
