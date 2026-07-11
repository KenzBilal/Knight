"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "why", title: "Why BYOK" },
  { id: "keys", title: "API Keys" },
  { id: "done", title: "Done" },
];

export default function KeysWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/settings/keys")
      .then(r => r.json())
      .then(data => {
        if (data.hasKeys) {
          setUseCustomKeys(true);
        }
      })
      .catch(() => {});
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
    }).then(async res => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving API keys...",
      success: "API keys saved!",
      error: "Failed to save",
    });

    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(2);
  }

  if (completed) {
    return (
      <WizardLayout
        title="API Keys Setup"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="API Keys Saved!"
          description="Knight will now use your personal API keys for AI operations. You maintain full control over your usage and costs."
          icon="🔑"
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/telegram")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="API Keys Setup"
      subtitle="Use your own AI provider keys (optional)"
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
          description="Optional — use your own AI provider keys"
          icon={<span className="text-2xl">🔑</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-paper-300">
              Knight comes with built-in AI keys for all providers. You don&apos;t need to add your own keys
              to get started.
            </p>
            <p className="text-sm text-paper-300">
              However, if you want full control over your AI usage and costs, you can provide your own API keys.
            </p>
            <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-2">
              <p className="text-xs text-paper-400 font-medium">Supported providers:</p>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">•</span>
                <span><strong>Cohere</strong> — Website audits & analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">•</span>
                <span><strong>Gemini</strong> — Pitch & reply generation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">•</span>
                <span><strong>OpenRouter</strong> — AI suggestions & recommendations</span>
              </div>
            </div>
            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">You can skip this — Knight&apos;s built-in keys work great for most users.</p>
              <button
                onClick={() => {
                  setCompleted(true);
                  setStep(2);
                }}
                className="text-xs text-flash-500 hover:text-flash-400"
              >
                Skip this step →
              </button>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Your API Keys"
          description="Enter keys for providers you want to use"
          icon={<span className="text-2xl">⚙️</span>}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-950 border border-line p-3">
              <p className="text-xs text-paper-400">
                Get keys from:{" "}
                <a href="https://cohere.com" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">cohere.com</a>,{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">Google AI Studio</a>,{" "}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">openrouter.ai</a>
              </p>
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Cohere API Key
                <span className="text-xs text-paper-500 ml-2">For website audits</span>
              </label>
              <input
                type="password"
                value={cohereKey}
                onChange={e => setCohereKey(e.target.value)}
                placeholder="Enter your Cohere API key"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Gemini API Key
                <span className="text-xs text-paper-500 ml-2">For pitch generation</span>
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                OpenRouter API Key
                <span className="text-xs text-paper-500 ml-2">For AI suggestions</span>
              </label>
              <input
                type="password"
                value={openrouterKey}
                onChange={e => setOpenrouterKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <p className="text-xs text-paper-500">
              You can leave any field blank to use Knight&apos;s built-in key for that provider.
            </p>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
