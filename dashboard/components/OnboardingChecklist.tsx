"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
}

export function OnboardingChecklist() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then(r => r.json()),
      fetch("/api/settings/keys").then(r => r.json()),
      fetch("/api/settings/domain").then(r => r.json()),
    ]).then(([config, keys, domains]) => {
      const hasCompany = !!config.company_name;
      const hasServices = config.services_offered?.length > 0;
      const hasKeys = keys.hasKeys;
      const hasDomain = domains.domains?.length > 0;
      const hasCalendly = !!config.calendly_link;

      setSteps([
        {
          id: "profile",
          title: "Complete your profile",
          description: "Add your company name, website, and services",
          href: "/dashboard/wizard/profile",
          completed: hasCompany && hasServices,
        },
        {
          id: "calendly",
          title: "Add Calendly link",
          description: "Let prospects book meetings with you",
          href: "/dashboard/wizard/calendly",
          completed: hasCalendly,
        },
        {
          id: "domain",
          title: "Verify email domain",
          description: "Send emails from your business address",
          href: "/dashboard/wizard/domain",
          completed: hasDomain,
        },
        {
          id: "apikeys",
          title: "Add API keys (optional)",
          description: "Use your own AI provider keys",
          href: "/dashboard/wizard/keys",
          completed: hasKeys,
        },
        {
          id: "discover",
          title: "Run your first discovery",
          description: "Find businesses that need your services",
          href: "/dashboard",
          completed: false,
        },
      ]);
      setLoading(false);
    });

    const dismissedAt = localStorage.getItem("onboarding_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("onboarding_dismissed", Date.now().toString());
    setDismissed(true);
  }

  if (loading || dismissed) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  return (
    <div className="rounded-xl border border-flash-500/30 bg-flash-500/5 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-paper-100">Get started with Knight</h3>
          <p className="text-sm text-paper-400">
            Complete these steps to start finding leads ({completedCount}/{steps.length})
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-xs text-paper-400 hover:text-paper-200 transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-ink-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-flash-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              step.completed
                ? "bg-green-500/5 border border-green-500/20"
                : "bg-ink-900 border border-line hover:border-flash-500/30"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step.completed
                ? "bg-green-500 text-ink-950"
                : "bg-ink-800 text-paper-400"
            }`}>
              {step.completed ? "✓" : "○"}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${step.completed ? "text-green-400" : "text-paper-100"}`}>
                {step.title}
              </p>
              <p className="text-xs text-paper-400">{step.description}</p>
            </div>
            {!step.completed && (
              <span className="text-xs text-flash-500">→</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
