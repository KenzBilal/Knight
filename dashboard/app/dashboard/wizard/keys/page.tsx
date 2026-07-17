"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "why", title: "Why" },
  { id: "keys", title: "Keys" },
  { id: "done", title: "Done" },
];

export default function KeysWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/settings/keys").then((r) => r.json()).catch(() => {});
  }, []);

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/settings/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohere_key: cohereKey || null,
        gemini_key: geminiKey || null,
        openrouter_key: openrouterKey || null,
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving keys...",
      success: "Keys saved!",
      error: "Failed",
    });
    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(2);
  }

  if (completed) {
    return (
      <WizardLayout
        title="API Keys"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Keys Saved!"
          description="Knight will use your personal API keys."
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/telegram")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="API Keys"
      subtitle="Optional — use your own AI keys"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      onComplete={step === 1 ? handleComplete : undefined}
      completeLabel="Save Keys"
      isSubmitting={saving}
    >
      {step === 0 && (
        <WizardCard
          title="Bring Your Own Keys"
          description="Optional"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <p className="text-[13px] text-[#525252] leading-relaxed">
              Knight has built-in keys. Add your own for full control over
              usage and costs.
            </p>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              <div className="text-[13px]">
                <strong className="text-white">Cohere</strong>
                <span className="text-[#3a3a3a] mx-2">—</span>
                <span className="text-[#525252]">Website audits</span>
              </div>
              <div className="text-[13px]">
                <strong className="text-white">Gemini</strong>
                <span className="text-[#3a3a3a] mx-2">—</span>
                <span className="text-[#525252]">Pitch generation</span>
              </div>
              <div className="text-[13px]">
                <strong className="text-white">OpenRouter</strong>
                <span className="text-[#3a3a3a] mx-2">—</span>
                <span className="text-[#525252]">AI suggestions</span>
              </div>
            </div>
            <button
              onClick={() => {
                setCompleted(true);
                setStep(2);
              }}
              className="text-[12px] text-[#3a3a3a] hover:text-white transition-colors"
            >
              Skip this step →
            </button>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Your API Keys"
          description="Enter keys for providers you use"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5">
              <p className="text-[12px] text-[#3a3a3a]">
                Get keys from:{" "}
                <a
                  href="https://cohere.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  cohere.com
                </a>
                ,{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  Google AI Studio
                </a>
                ,{" "}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  openrouter.ai
                </a>
              </p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Cohere
              </label>
              <input
                type="password"
                value={cohereKey}
                onChange={(e) => setCohereKey(e.target.value)}
                placeholder="Cohere API key"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200 font-mono text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Gemini
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Gemini API key"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200 font-mono text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                OpenRouter
              </label>
              <input
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="OpenRouter API key"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200 font-mono text-[13px]"
              />
            </div>
            <p className="text-[12px] text-[#3a3a3a]">
              Leave blank to use Knight&apos;s built-in key.
            </p>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
