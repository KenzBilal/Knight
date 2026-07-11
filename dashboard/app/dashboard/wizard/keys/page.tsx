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
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/settings/keys").then(r => r.json()).catch(() => {});
  }, []);

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/settings/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohere_key: cohereKey || null, gemini_key: geminiKey || null, openrouter_key: openrouterKey || null }),
    }).then(async res => { if (!res.ok) throw new Error("Failed"); return res.json(); });

    toast.promise(promise, { loading: "Saving keys...", success: "Keys saved!", error: "Failed" });
    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(2);
  }

  if (completed) {
    return (
      <WizardLayout title="API Keys" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
        <WizardComplete title="Keys Saved!" description="Knight will use your personal API keys." icon="🔑"
          onContinue={() => router.push("/dashboard")} onSetupMore={() => router.push("/dashboard/wizard/telegram")} />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout title="API Keys" subtitle="Optional — use your own AI keys" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard"
      onComplete={step === 1 ? handleComplete : undefined} completeLabel="Save Keys" isSubmitting={saving}>
      {step === 0 && (
        <WizardCard title="Bring Your Own Keys" description="Optional" icon={<span className="text-2xl">🔑</span>}>
          <div className="space-y-4">
            <p className="text-sm text-[#666]">Knight has built-in keys. Add your own for full control over usage and costs.</p>
            <div className="rounded-lg bg-white border border-[#ebebeb] p-4 space-y-2">
              <div className="text-xs text-[#666]"><strong className="text-[#111]">Cohere</strong> — Website audits</div>
              <div className="text-xs text-[#666]"><strong className="text-[#111]">Gemini</strong> — Pitch generation</div>
              <div className="text-xs text-[#666]"><strong className="text-[#111]">OpenRouter</strong> — AI suggestions</div>
            </div>
            <button onClick={() => { setCompleted(true); setStep(2); }} className="text-xs text-[#666] hover:text-[#111]">Skip this step →</button>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard title="Your API Keys" description="Enter keys for providers you use" icon={<span className="text-2xl">⚙️</span>}>
          <div className="space-y-4">
            <div className="rounded-lg bg-white border border-[#ebebeb] p-3">
              <p className="text-xs text-[#888]">
                Get keys from: <a href="https://cohere.com" target="_blank" rel="noopener noreferrer" className="text-[#111] hover:underline">cohere.com</a>,{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-[#111] hover:underline">Google AI Studio</a>,{" "}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-[#111] hover:underline">openrouter.ai</a>
              </p>
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-1.5">Cohere</label>
              <input type="password" value={cohereKey} onChange={e => setCohereKey(e.target.value)} placeholder="Cohere API key"
                className="w-full rounded-lg bg-white border border-[#ebebeb] px-4 py-2.5 text-sm text-[#111] placeholder:text-[#888] focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-1.5">Gemini</label>
              <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="Gemini API key"
                className="w-full rounded-lg bg-white border border-[#ebebeb] px-4 py-2.5 text-sm text-[#111] placeholder:text-[#888] focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-1.5">OpenRouter</label>
              <input type="password" value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)} placeholder="OpenRouter API key"
                className="w-full rounded-lg bg-white border border-[#ebebeb] px-4 py-2.5 text-sm text-[#111] placeholder:text-[#888] focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <p className="text-xs text-[#888]">Leave blank to use Knight&apos;s built-in key.</p>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
