"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "link", title: "Link" },
  { id: "preview", title: "Preview" },
  { id: "done", title: "Done" },
];

export default function CalendlyWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [calendlyLink, setCalendlyLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.calendly_link) setCalendlyLink(data.calendly_link);
      })
      .catch(() => {});
  }, []);

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendly_link: calendlyLink }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Failed",
    });
    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(3);
  }

  if (completed) {
    return (
      <WizardLayout
        title="Calendly Setup"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Calendly Connected!"
          description="Your scheduling link will be included in outreach emails."
          icon="📅"
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/domain")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Calendly Setup"
      subtitle="Let prospects book meetings with you"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      onComplete={step === 2 ? handleComplete : undefined}
      completeLabel="Save & Finish"
      isSubmitting={saving}
    >
      {step === 0 && (
        <WizardCard
          title="Why Calendly?"
          description="Include your scheduling link in emails"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        >
          <div className="space-y-5">
            <p className="text-[13px] text-[#525252] leading-relaxed">
              Knight includes your Calendly link in outreach emails so
              prospects can book meetings instantly.
            </p>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-2">
                Example
              </p>
              <p className="text-[13px] text-[#525252] italic leading-relaxed">
                &quot;...Feel free to grab a time:{" "}
                <span className="text-white not-italic">
                  calendly.com/yourname
                </span>
                &quot;
              </p>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Your Calendly Link"
          description="Paste your scheduling page URL"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.5" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Calendly URL
              </label>
              <input
                type="url"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                How to find your link
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">1.</span>
                  <span>
                    Go to{" "}
                    <a
                      href="https://calendly.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline"
                    >
                      calendly.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">2.</span>
                  <span>Click &quot;Copy link&quot; on your event type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">3.</span>
                  <span>Paste it above</span>
                </li>
              </ol>
            </div>
            {!calendlyLink && (
              <p className="text-[12px] text-[#3a3a3a]">
                You can skip this and add it later.
              </p>
            )}
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Preview"
          description="How your link appears in emails"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-4">
                Email preview
              </p>
              <div className="space-y-3 text-[13px] text-[#525252]">
                <p>Hi {"{{contact_name}}"},</p>
                <p>
                  I noticed your website could benefit from some improvements.
                </p>
                <p>
                  Book a quick call:{" "}
                  <span className="text-white">
                    {calendlyLink || "calendly.com/yourname"}
                  </span>
                </p>
                <p>
                  Best,
                  <br />
                  Your Name
                </p>
              </div>
            </div>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
