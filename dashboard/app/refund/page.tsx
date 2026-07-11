import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RefundPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-[#111] mb-4">Refund Policy</h1>
        <p className="text-sm text-[#888] mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-[#666] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">1. Overview</h2>
            <p>
              We want you to be satisfied. If you&apos;re not happy, we&apos;re here to help.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">2. Free Tier</h2>
            <p>
              Knight offers a free tier so you can test the service before committing. Use it to evaluate whether Knight meets your needs.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">3. Subscription Refunds</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>New subscriptions:</strong> Full refund within 7 days of your first payment.</li>
              <li><strong>Renewals:</strong> Non-refundable. Cancel anytime to prevent future charges.</li>
              <li><strong>Upgrades:</strong> Prorated difference charged. Downgrades take effect at period end.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">4. How to Request</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email <a href="mailto:billing@knight.com" className="text-[#111] hover:underline">billing@knight.com</a></li>
              <li>Include your account email and reason</li>
              <li>Processed within 3-5 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">5. Cancellation</h2>
            <p>
              Cancel anytime from your{" "}
              <Link href="/dashboard/billing" className="text-[#111] hover:underline">billing settings</Link>.
              You keep access until the end of your billing period.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">6. Contact</h2>
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:billing@knight.com" className="text-[#111] hover:underline">billing@knight.com</a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
