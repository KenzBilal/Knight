"use client";

import { useState } from "react";

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["100 prospects/month", "1 user", "Email only"], disabled: true },
  { name: "Starter", price: "$49", period: "month", features: ["2,500 prospects/month", "3 users", "Email + Telegram"], disabled: false },
  { name: "Pro", price: "$149", period: "month", features: ["10,000 prospects/month", "10 users", "All channels", "Priority support"], disabled: false },
  { name: "Agency", price: "$299", period: "month", features: ["Unlimited prospects", "Unlimited users", "White-label", "Dedicated support"], disabled: false },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceName: string) {
    setLoading(priceName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: priceName }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading(null);
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Billing</h1>

      <div className="rounded-xl border border-line bg-ink-900 p-6 mb-6">
        <p className="text-sm text-paper-400">Current plan: <span className="text-paper-200 font-medium">Free</span></p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-xl border border-line bg-ink-900 p-6 flex flex-col">
            <h3 className="font-display text-lg text-paper-100 mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-paper-100">{plan.price}</span>
              <span className="text-sm text-paper-400 ml-1">/ {plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-paper-300">✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(plan.name)}
              disabled={plan.disabled || loading === plan.name}
              className="w-full rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {plan.disabled ? "Current plan" : loading === plan.name ? "Redirecting..." : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
