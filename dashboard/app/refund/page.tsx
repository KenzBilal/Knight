import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Knight",
  description: "Knight's refund and cancellation policy for subscriptions.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Refund Policy</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <p>We want you to be satisfied with Knight. This policy explains when and how refunds are available. If you have a question or concern not covered here, please reach out to <a href="mailto:billing@knight.app" className="text-white hover:underline">billing@knight.app</a>.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Free tier</h2>
            <p>Knight offers a free plan that includes 50 leads and 50 emails per month. We encourage you to use it to evaluate whether Knight meets your needs before committing to a paid plan. No payment information is required to use the free tier.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">New subscriptions — 30-day guarantee</h2>
            <p className="mb-4">If you subscribe to a paid plan and are not satisfied, you may request a full refund within <strong className="text-[#a3a3a3]">30 days of your first payment</strong>. To qualify:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>The request must be made within 30 calendar days of initial payment</li>
              <li>The account must not have been suspended for Terms of Service violations</li>
              <li>Contact billing@knight.app from the email address associated with your account</li>
            </ul>
            <p className="mt-4">Refunds are processed within 5–10 business days and returned to the original payment method.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Subscription renewals</h2>
            <p>Renewals — both monthly and annual — are non-refundable. Subscriptions renew automatically unless cancelled before the renewal date. You can cancel at any time from your <Link href="/dashboard/billing" className="text-white hover:underline">billing settings</Link>. Cancellation takes effect at the end of your current billing period, and you retain full access until then.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Annual plans</h2>
            <p className="mb-4">Annual plan refunds are handled as follows:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Within the first 30 days: full refund available</li>
              <li>After 30 days: no refund. You retain access for the full year.</li>
              <li>Downgrading from annual to monthly mid-term: not supported. Your plan continues until the annual period ends.</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Plan upgrades and downgrades</h2>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li><strong className="text-[#a3a3a3]">Upgrades:</strong> take effect immediately. You are charged a prorated amount for the remainder of the current billing period.</li>
              <li><strong className="text-[#a3a3a3]">Downgrades:</strong> take effect at the start of the next billing period. You retain higher-tier access until then.</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Exceptions</h2>
            <p className="mb-4">Refunds are not available if:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Your account was terminated for violation of our Terms of Service or Acceptable Use Policy</li>
              <li>The refund request is made after the applicable window has passed</li>
              <li>The account shows evidence of abuse (e.g., multiple accounts created for repeated refund requests)</li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">How to request a refund</h2>
            <div className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-6">
              <ol className="space-y-3">
                {[
                  "Email billing@knight.app from your account email address",
                  "Include the subject line: 'Refund Request — [your email]'",
                  "Briefly describe the reason for your request (optional but helpful)",
                  "We will confirm receipt within 24 hours and process within 5–10 business days",
                ].map((step, i) => (
                  <li key={step} className="flex gap-4 text-sm">
                    <span className="font-mono text-[#3a3a3a] w-5 shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Cancellation</h2>
            <p>You can cancel your subscription at any time from your <Link href="/dashboard/billing" className="text-white hover:underline">billing settings</Link>. No refund is issued for cancellation after the 30-day window, but you retain access until the end of your paid period. We never charge cancellation fees.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Contact</h2>
            <p>Questions? Email <a href="mailto:billing@knight.app" className="text-white hover:underline">billing@knight.app</a>. We aim to respond within 24 hours on business days.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
