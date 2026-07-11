import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-[#111] mb-4">Terms of Service</h1>
        <p className="text-sm text-[#888] mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-[#666] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">1. Acceptance</h2>
            <p>
              By using Knight, you agree to these Terms. If you don&apos;t agree, don&apos;t use the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">2. Service</h2>
            <p>
              Knight is an AI-powered B2B sales automation platform that finds clients through website auditing,
              personalized outreach, and automated communication via email and Telegram.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">3. Account</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must be 18+ to use Knight</li>
              <li>Provide accurate registration information</li>
              <li>Maintain your password security</li>
              <li>You&apos;re responsible for activity under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">4. Acceptable Use</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No unlawful use</li>
              <li>No spam or unsolicited communications</li>
              <li>Comply with anti-spam laws (CAN-SPAM, GDPR)</li>
              <li>No unauthorized access attempts</li>
              <li>No harassment or harm to others</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">5. Payment</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Free and paid plans available</li>
              <li>Fees are non-refundable except per our Refund Policy</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>We may change fees with 30 days&apos; notice</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">6. Your Data</h2>
            <p>
              You own your data. We won&apos;t sell it. You grant us a limited license to process it as needed to provide the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">7. Liability</h2>
            <p>
              To the maximum extent permitted by law, Knight is not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">8. Contact</h2>
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:legal@knight.com" className="text-[#111] hover:underline">legal@knight.com</a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
