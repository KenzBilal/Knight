import Link from "next/link";

export default function RefundPage() {
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
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-4">Refund Policy</h1>
        <p className="text-sm text-paper-400 mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-paper-300 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">1. Overview</h2>
            <p>
              We want you to be satisfied with your purchase. If you&apos;re not happy with our service, 
              we&apos;re here to help. This refund policy outlines the circumstances under which we offer refunds.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">2. Free Trial</h2>
            <p>
              Knight offers a free tier that allows you to test the service before committing to a paid plan. 
              We encourage you to use the free tier to evaluate whether Knight meets your needs before upgrading.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">3. Subscription Refunds</h2>
            <p className="mb-4">For paid subscriptions:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>New subscriptions:</strong> If you&apos;re not satisfied within the first 7 days of your 
                first paid subscription, contact us for a full refund.
              </li>
              <li>
                <strong>Renewals:</strong> Subscription renewals are non-refundable. You may cancel your subscription 
                at any time to prevent future charges.
              </li>
              <li>
                <strong>Upgrades:</strong> When upgrading your plan, you&apos;ll be charged the prorated difference. 
                Downgrades take effect at the end of your current billing period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">4. How to Request a Refund</h2>
            <p className="mb-4">To request a refund:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email us at <a href="mailto:billing@knight.com" className="text-flash-500 hover:underline">billing@knight.com</a></li>
              <li>Include your account email and reason for the refund request</li>
              <li>Refund requests are typically processed within 3-5 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">5. Non-Refundable Items</h2>
            <p className="mb-4">The following are not eligible for refunds:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Subscription renewals after the first billing period</li>
              <li>Accounts terminated for Terms of Service violations</li>
              <li>Custom enterprise arrangements</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">6. Cancellation</h2>
            <p>
              You may cancel your subscription at any time through your{" "}
              <Link href="/dashboard/billing" className="text-flash-500 hover:underline">billing settings</Link>.
              {" "}Cancellation takes effect at the end of your current billing period. You will continue to have 
              access to the service until that date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-paper-100 mb-4">7. Contact</h2>
            <p>
              For refund requests or questions about this policy, contact us at{" "}
              <a href="mailto:billing@knight.com" className="text-flash-500 hover:underline">billing@knight.com</a>
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
