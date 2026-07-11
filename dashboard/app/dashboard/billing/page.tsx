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
  
  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-[#111] mb-6 tracking-tight">Billing</h1>

      {/* Usage Counter */}
      {isFree && (
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#111]">This month's usage</p>
            <p className="text-xs text-[#999]">Resets on the 1st</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[#555]">Leads</span>
                <span className="text-sm font-mono text-[#888]">
                  <span className="text-[#111] font-semibold">{leadsUsed}</span> / {leadsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%` }}
                />
              </div>
              {leadsUsed >= leadsLimit * 0.8 && (
                <p className="text-xs text-red-500 mt-2">
                  {leadsUsed >= leadsLimit ? "Limit reached" : `${leadsLimit - leadsUsed} remaining`}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[#555]">Emails</span>
                <span className="text-sm font-mono text-[#888]">
                  <span className="text-[#111] font-semibold">{emailsUsed}</span> / {emailsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((emailsUsed / emailsLimit) * 100, 100)}%` }}
                />
              </div>
              {emailsUsed >= emailsLimit * 0.8 && (
                <p className="text-xs text-red-500 mt-2">
                  {emailsUsed >= emailsLimit ? "Limit reached" : `${emailsLimit - emailsUsed} remaining`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isFree && usage && (
        <div className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-between" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
          <div>
            <p className="text-sm text-[#555]">
              Current plan: <span className="text-[#111] font-bold capitalize">{currentPlan}</span>
            </p>
            <p className="text-xs text-[#999] mt-1">Unlimited leads and emails</p>
          </div>
          <button onClick={handleManageSubscription} disabled={loading === "portal"}
            className="text-sm text-[#555] hover:text-[#111] transition-colors border border-[#ebebeb] rounded-xl px-4 py-2 hover:bg-[#f7f7f7]">
            {loading === "portal" ? "Loading..." : "Manage"}
          </button>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();
          return (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col transition-all ${
              plan.highlighted
                ? "bg-[#111] text-white"
                : "bg-white text-[#111]"
            }`}
            style={plan.highlighted ? { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } : { boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
              {plan.highlighted && (
                <span className="text-[10px] font-mono text-yellow-400 mb-3 tracking-wider bg-white/10 px-2 py-0.5 rounded-full self-start">RECOMMENDED</span>
              )}
              <h3 className="font-display text-lg font-bold">{plan.name}</h3>
              <div className="mb-4 mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.highlighted ? "text-white/60" : "text-[#999]"}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2.5 ${plan.highlighted ? "text-white/80" : "text-[#555]"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-white/40" : "text-[#bbb]"}`}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => plan.variant && handleCheckout(plan.variant)}
                disabled={isCurrent || !plan.variant || loading === plan.variant}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-[#f5f5f5] text-[#aaa] cursor-not-allowed border border-[#ebebeb]"
                    : plan.highlighted
                    ? "bg-white text-[#111] hover:bg-[#f0f0f0]"
                    : "border border-[#ebebeb] text-[#111] hover:bg-[#f7f7f7]"
                } disabled:opacity-50`}>
                {isCurrent ? "Current plan" : loading === plan.variant ? "Redirecting..." : plan.variant ? "Upgrade" : "Get started"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
