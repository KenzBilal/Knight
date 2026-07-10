"use client";

import { useState, useEffect } from "react";

const plans = [
  { 
    name: "Free", 
    price: "$0", 
    period: "forever", 
    description: "Try Knight with no commitment.",
    features: ["50 leads/month", "50 emails/month", "Basic audit", "Dashboard access"],
    variant: null,
    highlighted: false,
  },
  { 
    name: "Starter", 
    price: "$49", 
    period: "/ month", 
    description: "For freelancers getting started.",
    features: ["Unlimited leads", "Unlimited emails", "Full audit (30+ checks)", "AI pitch generation", "CRM pipeline"],
    variant: "starter",
    highlighted: false,
  },
  { 
    name: "Pro", 
    price: "$149", 
    period: "/ month", 
    description: "For agencies scaling outreach.",
    features: [
      "Everything in Starter",
      "Telegram agent",
      "Drip sequences",
      "Smart inbox",
      "Custom domain email",
      "BYOK (bring your own keys)",
    ],
    variant: "pro",
    highlighted: true,
  },
  { 
    name: "Agency", 
    price: "$299", 
    period: "/ month", 
    description: "For teams and white-label.",
    features: [
      "Everything in Pro",
      "White-label (no Knight branding)",
      "Team accounts (10 seats)",
      "API access",
      "Priority support",
    ],
    variant: "agency",
    highlighted: false,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usage, setUsage] = useState({ leads: 0, emails: 0 });

  useEffect(() => {
    // Fetch current plan and usage
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data.org?.plan) setCurrentPlan(data.org.plan);
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(variant: string) {
    setLoading(variant);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: variant }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading(null);
  }

  async function handleManageSubscription() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.portalUrl) window.location.href = data.portalUrl;
    } catch {}
    setLoading(null);
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Billing</h1>

      {/* Current Plan */}
      <div className="rounded-xl border border-line bg-ink-900 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-paper-400">
              Current plan:{" "}
              <span className="text-paper-200 font-medium capitalize">{currentPlan}</span>
            </p>
            {currentPlan === "free" && (
              <p className="text-xs text-paper-500 mt-1">
                {usage.leads}/50 leads used this month | {usage.emails}/50 emails used
              </p>
            )}
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handleManageSubscription}
              disabled={loading === "portal"}
              className="text-sm text-flash-500 hover:text-flash-400 transition-colors"
            >
              {loading === "portal" ? "Loading..." : "Manage subscription"}
            </button>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();
          return (
            <div 
              key={plan.name} 
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlighted 
                  ? "border-flash-500/60 bg-ink-900 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]" 
                  : "border-line bg-ink-900"
              }`}
            >
              {plan.highlighted && (
                <span className="text-xs font-mono text-flash-500 mb-2">MOST POPULAR</span>
              )}
              <h3 className="font-display text-lg text-paper-100">{plan.name}</h3>
              <p className="text-xs text-paper-400 mt-1 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-paper-100">{plan.price}</span>
                <span className="text-sm text-paper-400 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-paper-300 flex items-start gap-2">
                    <span className="text-flash-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.variant && handleCheckout(plan.variant)}
                disabled={isCurrent || !plan.variant || loading === plan.variant}
                className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-ink-800 text-paper-400 cursor-not-allowed"
                    : plan.highlighted
                    ? "bg-flash-500 text-ink-950 hover:bg-flash-400"
                    : "border border-line text-paper-300 hover:bg-ink-800"
                } disabled:opacity-50`}
              >
                {isCurrent 
                  ? "Current plan" 
                  : loading === plan.variant 
                  ? "Redirecting..." 
                  : plan.variant 
                  ? "Upgrade" 
                  : "Get started"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 rounded-xl border border-line bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100 mb-4">Billing FAQ</h2>
        <div className="space-y-4 text-sm text-paper-300">
          <div>
            <p className="font-medium text-paper-200">Can I cancel anytime?</p>
            <p className="text-paper-400">Yes. No contracts, no lock-in. Cancel from your dashboard and keep access until the end of your billing period.</p>
          </div>
          <div>
            <p className="font-medium text-paper-200">What payment methods do you accept?</p>
            <p className="text-paper-400">All major credit cards, debit cards, and other payment methods supported by LemonSqueezy.</p>
          </div>
          <div>
            <p className="font-medium text-paper-200">Do you offer refunds?</p>
            <p className="text-paper-400">Yes. New subscriptions can be refunded within 7 days. See our <a href="/refund" className="text-flash-500 hover:underline">Refund Policy</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
