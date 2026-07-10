import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-paper-100">Knight</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-4">Terms of Service</h1>
        <p className="text-sm text-paper-400 mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-paper-300 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Knight (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">2. Description of Service</h2>
            <p>
              Knight is an AI-powered B2B sales automation platform that helps businesses find potential clients 
              through website auditing, personalized outreach, and automated communication via email and Telegram.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">3. Account Registration</h2>
            <p className="mb-4">To use the Service, you must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Send spam or unsolicited communications</li>
              <li>Violate anti-spam laws (CAN-SPAM, GDPR, etc.)</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">5. Subscriptions and Payment</h2>
            <p className="mb-4">
              The Service offers both free and paid subscription plans. By selecting a paid plan, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pay all fees associated with your chosen plan</li>
              <li>Fees are non-refundable except as described in our Refund Policy</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>We may change fees with 30 days&apos; notice</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">6. Your Data</h2>
            <p>
              You retain ownership of all data you input into the Service. We will not sell your data to third 
              parties. You grant us a limited license to process your data as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Knight and are 
              protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Knight shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, 
              for conduct that we determine, in our sole discretion, violates these Terms or is harmful to other 
              users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material changes 
              by posting the updated Terms on this page. Your continued use of the Service after changes constitutes 
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@knight.com" className="text-flash-500 hover:underline">legal@knight.com</a>
              {" "}or visit our{" "}
              <Link href="/contact" className="text-flash-500 hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="font-display text-sm text-paper-400">Knight</span>
              <Link href="/about" className="text-xs text-paper-400 hover:text-paper-200">About</Link>
              <Link href="/contact" className="text-xs text-paper-400 hover:text-paper-200">Contact</Link>
              <Link href="/privacy" className="text-xs text-paper-400 hover:text-paper-200">Privacy</Link>
              <Link href="/terms" className="text-xs text-paper-400 hover:text-paper-200">Terms</Link>
              <Link href="/refund" className="text-xs text-paper-400 hover:text-paper-200">Refund</Link>
            </div>
            <span className="text-xs text-paper-400">© {new Date().getFullYear()} Knight. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
