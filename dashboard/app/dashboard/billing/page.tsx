"use client";

import { useState, useEffect } from "react";

interface UsageData {
  plan: string;
  usage: { leads: number; emails: number };
  limits: { leads: number; emails: number };
}

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["50 leads/mo", "50 emails/mo", "Basic audit", "Dashboard"], variant: null, highlighted: false },
  { name: "Starter", price: "$49", period: "/mo", features: ["Unlimited leads", "Unlimited emails", "Full audit", "AI pitches", "CRM pipeline"], variant: "starter", highlighted: false },
  { name: "Pro", price: "$149", period: "/mo", features: ["Everything in Starter", "Telegram agent", "Drip sequences", "Smart inbox", "Custom domain", "BYOK"], variant: "pro", highlighted: true },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(data => {
        setCurrentPlan(data.plan || "free");
        setUsage(data);
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
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.portalUrl) window.location.href = data.portalUrl;
    } catch {}
    setLoading(null);
  }

  const isFree = currentPlan === "free";
  const leadsUsed = usage?.usage.leads || 0;
  const emailsUsed = usage?.usage.emails || 0;
  const leadsLimit = usage?.limits.leads || 50;
  const emailsLimit = usage?.limits.emails || 50;
  const unlimited = leadsLimit === -1;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Billing</h1>

      {/* Usage Counter */}
      {isFree && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-400">This month&apos;s usage</p>
            <p className="text-xs text-neutral-500">Resets on the 1st</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-neutral-300">Leads</span>
                <span className="text-sm font-mono text-neutral-400">
                  <span className="text-paper-100">{leadsUsed}</span> / {leadsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%` }}
                />
              </div>
              {leadsUsed >= leadsLimit * 0.8 && (
                <p className="text-xs text-red-400 mt-1">
                  {leadsUsed >= leadsLimit ? "Limit reached" : `${leadsLimit - leadsUsed} remaining`}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-neutral-300">Emails</span>
                <span className="text-sm font-mono text-neutral-400">
                  <span className="text-paper-100">{emailsUsed}</span> / {emailsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((emailsUsed / emailsLimit) * 100, 100)}%` }}
                />
              </div>
              {emailsUsed >= emailsLimit * 0.8 && (
                <p className="text-xs text-red-400 mt-1">
                  {emailsUsed >= emailsLimit ? "Limit reached" : `${emailsLimit - emailsUsed} remaining`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isFree && usage && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">
                Current plan: <span className="text-paper-100 font-medium capitalize">{currentPlan}</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">Unlimited leads and emails</p>
            </div>
            <button onClick={handleManageSubscription} disabled={loading === "portal"}
              className="text-sm text-neutral-400 hover:text-paper-100 transition-colors border border-neutral-700 rounded-lg px-4 py-2 hover:bg-neutral-800">
              {loading === "portal" ? "Loading..." : "Manage"}
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();
          return (
            <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${
              plan.highlighted
                ? "border-neutral-600 bg-neutral-900/80"
                : "border-neutral-800 bg-neutral-900/50"
            }`}>
              {plan.highlighted && (
                <span className="text-xs font-mono text-red-400 mb-2 tracking-wider">RECOMMENDED</span>
              )}
              <h3 className="font-display text-lg text-paper-100">{plan.name}</h3>
              <div className="mb-4 mt-2">
                <span className="text-3xl font-bold text-paper-100">{plan.price}</span>
                <span className="text-sm text-neutral-500 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-neutral-400 flex items-start gap-2">
                    <span className="text-neutral-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => plan.variant && handleCheckout(plan.variant)}
                disabled={isCurrent || !plan.variant || loading === plan.variant}
                className={`w-full rounded-lg py-2.5 text-sm font-medium transition-all ${
                  isCurrent
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                    : plan.highlighted
                    ? "bg-paper-100 text-neutral-950 hover:bg-paper-200"
                    : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
                } disabled:opacity-50`}>
                {isCurrent ? "Current" : loading === plan.variant ? "Redirecting..." : plan.variant ? "Upgrade" : "Get started"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
