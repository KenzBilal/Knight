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
          description: "",
          href: "/dashboard/wizard/profile",
          completed: hasCompany && hasServices,
        },
        {
          id: "calendly",
          title: "Add Calendly link",
          description: "",
          href: "/dashboard/wizard/calendly",
          completed: hasCalendly,
        },
        {
          id: "domain",
          title: "Verify email domain",
          description: "",
          href: "/dashboard/wizard/domain",
          completed: hasDomain,
        },
        {
          id: "apikeys",
          title: "Add API keys",
          description: "",
          href: "/dashboard/wizard/keys",
          completed: hasKeys,
        },
        {
          id: "discover",
          title: "Run your first discovery",
          description: "",
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 mb-6 matte-texture">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-paper-100">Get started</h3>
          <p className="text-sm text-neutral-400">
            {completedCount}/{steps.length} completed
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Dismiss
        </button>
      </div>

      <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-neutral-400 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              step.completed
                ? "bg-neutral-800/50 border border-neutral-700"
                : "bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step.completed
                ? "bg-paper-100 text-neutral-950"
                : "bg-neutral-800 text-neutral-500"
            }`}>
              {step.completed ? "✓" : "○"}
            </div>
            <p className={`text-sm ${step.completed ? "text-neutral-400 line-through" : "text-paper-100"}`}>
              {step.title}
            </p>
            {!step.completed && <span className="text-xs text-neutral-500 ml-auto">→</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
