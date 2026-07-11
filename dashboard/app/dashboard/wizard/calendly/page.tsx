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
      .then(data => {
        if (data.calendly_link) {
          setCalendlyLink(data.calendly_link);
        }
      })
      .catch(() => {});
  }, []);

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendly_link: calendlyLink }),
    }).then(async res => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving Calendly link...",
      success: "Calendly link saved!",
      error: "Failed to save",
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
          description="Your scheduling link will now be included in outreach emails so prospects can book meetings with you directly."
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
      subtitle="Let prospects book meetings with you automatically"
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
          description="Include your scheduling link in outreach emails"
          icon={<span className="text-2xl">📅</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-paper-300">
              When Knight sends outreach emails to prospects, it automatically includes your Calendly link.
              This makes it easy for interested prospects to book a meeting with you — no back-and-forth needed.
            </p>
            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">Example email snippet:</p>
              <p className="text-sm text-paper-300 italic">
                &quot;...If you&apos;d like to discuss how we can help, feel free to grab a time that works for you:{" "}
                <span className="text-flash-500">calendly.com/yourname</span>&quot;
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-paper-400">
              <span className="text-green-500">✓</span>
              <span>Higher response rates — prospects can book instantly</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-paper-400">
              <span className="text-green-500">✓</span>
              <span>No back-and-forth scheduling emails</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-paper-400">
              <span className="text-green-500">✓</span>
              <span>Works with any Calendly plan (including free)</span>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Your Calendly Link"
          description="Paste your personal scheduling page URL"
          icon={<span className="text-2xl">🔗</span>}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Calendly URL
              </label>
              <input
                type="url"
                value={calendlyLink}
                onChange={e => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>
            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">How to find your link:</p>
              <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">calendly.com</a></li>
                <li>Click &quot;Copy link&quot; on your event type</li>
                <li>Paste it above</li>
              </ol>
            </div>
            {!calendlyLink && (
              <p className="text-xs text-yellow-500">
                You can skip this for now and add it later in Settings.
              </p>
            )}
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Preview"
          description="See how your link will appear in emails"
          icon={<span className="text-2xl">👁</span>}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-950 border border-line p-6">
              <div className="text-xs text-paper-500 mb-3">Email preview:</div>
              <div className="space-y-3 text-sm text-paper-300">
                <p>Hi {"{{contact_name}}"},</p>
                <p>
                  I noticed your website could benefit from some improvements.
                  We specialize in helping businesses like yours grow online.
                </p>
                <p>
                  If you&apos;d like to chat about how we can help, feel free to
                  book a quick call:
                </p>
                <p className="text-flash-500">
                  {calendlyLink || "calendly.com/yourname"}
                </p>
                <p>
                  Best,<br />
                  Your Name
                </p>
              </div>
            </div>
            {calendlyLink && (
              <div className="flex items-center gap-2 text-xs text-green-500">
                <span>✓</span>
                <span>Your Calendly link will be included in all outreach emails</span>
              </div>
            )}
            {!calendlyLink && (
              <div className="flex items-center gap-2 text-xs text-yellow-500">
                <span>⚠</span>
                <span>No Calendly link — emails won&apos;t include a booking link</span>
              </div>
            )}
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
