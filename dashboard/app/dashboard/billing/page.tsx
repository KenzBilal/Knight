"use client";

import { useState, useEffect } from "react";

interface PlanData {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string | null;
  features: string[];
  lead_limit: number;
  email_limit: number;
  highlighted: boolean;
  lemon_variant_id: string | null;
}

interface UsageData {
  plan: string;
  usage: { leads: number; emails: number };
  limits: { leads: number; emails: number };
}

function formatPrice(cents: number) {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}

function formatPeriod(period: string) {
  if (period === "forever") return "";
  if (period === "month") return "/mo";
  if (period === "year") return "/yr";
  if (period === "once") return " one-time";
  return "";
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plans, setPlans] = useState<PlanData[]>([]);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(data => {
        setCurrentPlan(data.plan || "free");
        setUsage(data);
      })
      .catch(() => {});

    fetch("/api/plans")
      .then(r => r.json())
      .then(data => {
        if (data.plans) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(variantId: string) {
    setLoading(variantId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId }),
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
      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Billing</h1>

      {/* Usage Counter */}
      {isFree && (
        <div className="dash-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>This month&apos;s usage</p>
            <p className="text-xs text-[#525252]">Resets on the 1st</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[#a3a3a3]">Leads</span>
                <span className="text-sm text-[#525252]" style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="text-white font-semibold">{leadsUsed}</span> / {leadsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%` }}
                />
              </div>
              {leadsUsed >= leadsLimit * 0.8 && (
                <p className="text-xs text-red-400 mt-2">
                  {leadsUsed >= leadsLimit ? "Limit reached" : `${leadsLimit - leadsUsed} remaining`}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[#a3a3a3]">Emails</span>
                <span className="text-sm text-[#525252]" style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="text-white font-semibold">{emailsUsed}</span> / {emailsLimit}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((emailsUsed / emailsLimit) * 100, 100)}%` }}
                />
              </div>
              {emailsUsed >= emailsLimit * 0.8 && (
                <p className="text-xs text-red-400 mt-2">
                  {emailsUsed >= emailsLimit ? "Limit reached" : `${emailsLimit - emailsUsed} remaining`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isFree && usage && (
        <div className="dash-card rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#a3a3a3]">
              Current plan: <span className="text-white font-bold capitalize">{currentPlan}</span>
            </p>
            <p className="text-xs text-[#525252] mt-1">Unlimited leads and emails</p>
          </div>
          <button onClick={handleManageSubscription} disabled={loading === "portal"}
            className="text-sm text-[#a3a3a3] hover:text-white transition-colors dash-card rounded-xl px-4 py-2 hover:bg-white/[0.04]">
            {loading === "portal" ? "Loading..." : "Manage"}
          </button>
        </div>
      )}

      {/* Plan Cards — from DB */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className={`rounded-2xl p-6 flex flex-col transition-all ${
              plan.highlighted
                ? "bg-white text-[#080808]"
                : "dash-card text-white"
            }`}>
              {plan.highlighted && (
                <span className="text-[10px] text-[#525252] mb-3 tracking-wider bg-white/[0.06] px-2 py-0.5 rounded-lg self-start" style={{ fontFamily: "var(--font-mono)" }}>RECOMMENDED</span>
              )}
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{plan.name}</h3>
              {plan.description && (
                <p className={`text-xs mt-1 ${plan.highlighted ? "text-[#525252]" : "text-[#525252]"}`}>{plan.description}</p>
              )}
              <div className="mb-4 mt-2">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                <span className={`text-sm ml-1 ${plan.highlighted ? "text-[#525252]" : "text-[#525252]"}`}>{formatPeriod(plan.period)}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2.5 ${plan.highlighted ? "text-[#3a3a3a]" : "text-[#a3a3a3]"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-[#525252]" : "text-[#525252]"}`}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.lemon_variant_id && handleCheckout(plan.lemon_variant_id)}
                disabled={isCurrent || !plan.lemon_variant_id || loading === plan.lemon_variant_id}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-[#f0f0f0] text-[#525252] cursor-not-allowed border border-[#e0e0e0]"
                    : plan.highlighted
                    ? "bg-[#080808] text-white hover:bg-[#161616] active:scale-[0.98]"
                    : "dash-card text-white hover:bg-white/[0.04]"
                } disabled:opacity-50`}>
                {isCurrent ? "Current plan" : loading === plan.lemon_variant_id ? "Redirecting..." : plan.lemon_variant_id ? "Upgrade" : "Coming soon"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
