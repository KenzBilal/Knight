import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-4">Privacy Policy</h1>
        <p className="text-sm text-paper-400 mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-paper-300 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">1. Introduction</h2>
            <p>
              Welcome to Knight (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (name, email address, password)</li>
              <li>Company profile (company name, website, services offered)</li>
              <li>Payment information (processed securely via LemonSqueezy)</li>
              <li>Communication data (messages you send through our contact form)</li>
              <li>API keys you choose to provide for AI services</li>
              <li>Telegram account information (if you choose to connect)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, operate, and maintain our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send administrative information (account confirmations, updates)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve and personalize our services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud or unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">4. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information only in the following situations:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>With service providers who help us operate our platform (Supabase, LemonSqueezy, Resend)</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. 
              However, no method of transmission over the Internet or electronic storage is 100% secure, and we 
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to provide our services and fulfill 
              the purposes described in this policy. When you delete your account, we will remove your personal 
              information within 30 days, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request portability of your personal information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">8. Cookies</h2>
            <p>
              We use cookies to maintain your session and authentication status. You can instruct your browser 
              to refuse all cookies, though some features of our service may not function properly without them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@knight.com" className="text-flash-500 hover:underline">privacy@knight.com</a>
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
