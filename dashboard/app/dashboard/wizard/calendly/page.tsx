"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete, WizardInfoRow } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "link", title: "Link" },
  { id: "preview", title: "Preview" },
  { id: "done", title: "Done" },
];

const inputCls =
  "w-full rounded-xl bg-[#0a0a0a] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.22] focus:ring-2 focus:ring-white/[0.04] transition-all duration-200";

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
          description="Your scheduling link will now be automatically included in outreach emails so prospects can book instantly."
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/domain")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Calendly Setup"
      subtitle="Let prospects book meetings with you directly from your outreach emails"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      onComplete={step === 2 ? handleComplete : undefined}
      completeLabel="Save & Finish"
      isSubmitting={saving}
    >
      {/* ── Step 0: Why ── */}
      {step === 0 && (
        <WizardCard
          title="Why add Calendly?"
          description="Frictionless scheduling converts more replies into booked meetings"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        >
          <div className="space-y-5">
            <WizardInfoRow>
              <p className="text-[13px] text-[#525252] leading-relaxed">
                Knight automatically appends your Calendly link to every outreach email. Prospects click once to book — no back-and-forth.
              </p>
            </WizardInfoRow>

            {/* Email snippet preview */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-[10px] text-[#2a2a2a] uppercase tracking-widest font-semibold mb-3">
                Example snippet
              </p>
              <p className="text-[13px] text-[#525252] italic leading-relaxed">
                &quot;...Feel free to grab a time:{" "}
                <span className="text-white not-italic font-medium">
                  calendly.com/yourname
                </span>
                &quot;
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "2× more replies", sub: "on average" },
                { label: "Zero friction", sub: "no scheduling emails" },
                { label: "Auto-included", sub: "in every pitch" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <p className="text-[12px] font-semibold text-white">{stat.label}</p>
                  <p className="text-[10px] text-[#3a3a3a] mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </WizardCard>
      )}

      {/* ── Step 1: Enter Link ── */}
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
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-widest mb-2.5">
                Calendly URL
              </label>
              <input
                type="url"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className={inputCls}
                autoFocus
              />
            </div>

            <WizardInfoRow>
              <p className="text-[10px] text-[#3a3a3a] uppercase tracking-widest font-semibold mb-3">
                How to find your link
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                {[
                  <>
                    Go to{" "}
                    <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                      calendly.com
                    </a>{" "}
                    and sign in
                  </>,
                  <>Click &quot;Copy link&quot; on your event type</>,
                  <>Paste it above</>,
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#2a2a2a] font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </WizardInfoRow>

            {!calendlyLink && (
              <p className="text-[12px] text-[#2a2a2a] text-center">
                You can skip this and add it later in settings.
              </p>
            )}
          </div>
        </WizardCard>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 2 && (
        <WizardCard
          title="Email Preview"
          description="How your Calendly link appears in outreach emails"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Fake window chrome */}
              <div
                className="px-5 py-3 flex items-center gap-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0e0e0e" }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]/40" />
                </div>
                <span className="text-[11px] text-[#2a2a2a]">Email Preview</span>
              </div>

              <div className="p-5 sm:p-6 space-y-3 text-[13px] text-[#525252] leading-relaxed">
                <p>Hi {"{{contact_name}}"},</p>
                <p>I noticed your website could benefit from some improvements.</p>
                <p>
                  Book a quick call:{" "}
                  <span
                    className="text-white underline underline-offset-2 decoration-white/30"
                  >
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

            <p className="text-[11px] text-[#2a2a2a] text-center">
              Actual emails are personalized per prospect.
            </p>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
