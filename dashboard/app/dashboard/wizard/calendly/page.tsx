"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "link", title: "Calendly Link" },
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
      .then(r => r.json())
      .then(data => { if (data.calendly_link) setCalendlyLink(data.calendly_link); })
      .catch(() => {});
  }, []);

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendly_link: calendlyLink }),
    }).then(async res => { if (!res.ok) throw new Error("Failed"); return res.json(); });

    toast.promise(promise, { loading: "Saving...", success: "Saved!", error: "Failed" });
    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(3);
  }

  if (completed) {
    return (
      <WizardLayout title="Calendly Setup" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
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
        <WizardCard title="Why Calendly?" description="Include your scheduling link in emails" icon={<span className="text-2xl">📅</span>}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              Knight includes your Calendly link in outreach emails so prospects can book meetings instantly.
            </p>
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-2">Example:</p>
              <p className="text-sm text-neutral-400 italic">
                &quot;...Feel free to grab a time: <span className="text-paper-100">calendly.com/yourname</span>&quot;
              </p>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard title="Your Calendly Link" description="Paste your scheduling page URL" icon={<span className="text-2xl">🔗</span>}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Calendly URL</label>
              <input type="url" value={calendlyLink} onChange={e => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-2">How to find your link:</p>
              <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-paper-100 hover:underline">calendly.com</a></li>
                <li>Click &quot;Copy link&quot; on your event type</li>
                <li>Paste it above</li>
              </ol>
            </div>
            {!calendlyLink && <p className="text-xs text-neutral-500">You can skip this and add it later.</p>}
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard title="Preview" description="How your link appears in emails" icon={<span className="text-2xl">👁</span>}>
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-6">
              <div className="text-xs text-neutral-600 mb-3">Email preview:</div>
              <div className="space-y-3 text-sm text-neutral-400">
                <p>Hi {"{{contact_name}}"},</p>
                <p>I noticed your website could benefit from some improvements.</p>
                <p>Book a quick call: <span className="text-paper-100">{calendlyLink || "calendly.com/yourname"}</span></p>
                <p>Best,<br />Your Name</p>
              </div>
            </div>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
