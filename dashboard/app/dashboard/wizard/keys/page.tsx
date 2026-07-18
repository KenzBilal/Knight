"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete, WizardInfoRow } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "why", title: "Why" },
  { id: "keys", title: "Keys" },
  { id: "done", title: "Done" },
];

const inputCls =
  "w-full rounded-xl bg-[#0a0a0a] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.22] focus:ring-2 focus:ring-white/[0.04] transition-all duration-200 font-mono text-[13px]";

const PROVIDERS = [
  {
    name: "Cohere",
    use: "Website audits",
    href: "https://cohere.com",
    placeholder: "co-...",
  },
  {
    name: "Gemini",
    use: "Pitch generation",
    href: "https://aistudio.google.com",
    placeholder: "AIza...",
  },
  {
    name: "OpenRouter",
    use: "AI suggestions",
    href: "https://openrouter.ai",
    placeholder: "sk-or-...",
  },
];

export default function KeysWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/settings/keys")
      .then((r) => r.json())
      .catch(() => {});
  }, []);

  function toggleShow(name: string) {
    setShowKeys((prev) => ({ ...prev, [name]: !prev[name] }));
  }

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
          description="Knight will now use your personal API keys for full control over usage and costs."
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/telegram")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="API Keys"
      subtitle="Optional — bring your own keys for full control over costs and rate limits"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      onComplete={step === 1 ? handleComplete : undefined}
      completeLabel="Save Keys"
      isSubmitting={saving}
    >
      {/* ── Step 0: Why ── */}
      {step === 0 && (
        <WizardCard
          title="Bring Your Own Keys"
          description="Optional — Knight has built-in keys but you can use your own"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <WizardInfoRow>
              <p className="text-[13px] text-[#525252] leading-relaxed">
                Knight ships with shared API keys so you can start immediately. Adding your own gives you higher rate limits and full cost visibility.
              </p>
            </WizardInfoRow>

            <div className="space-y-3">
              {PROVIDERS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <p className="text-[13px] text-white font-semibold">{p.name}</p>
                    <p className="text-[12px] text-[#525252]">{p.use}</p>
                  </div>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#525252] hover:text-white transition-colors flex items-center gap-1"
                  >
                    Get key
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setCompleted(true);
                setStep(2);
              }}
              className="text-[12px] text-[#2a2a2a] hover:text-[#525252] transition-colors w-full text-center py-1"
            >
              Skip — use Knight&apos;s built-in keys →
            </button>
          </div>
        </WizardCard>
      )}

      {/* ── Step 1: Enter Keys ── */}
      {step === 1 && (
        <WizardCard
          title="Your API Keys"
          description="Leave any field blank to use Knight's built-in key"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            {[
              {
                label: "Cohere",
                value: cohereKey,
                set: setCohereKey,
                placeholder: PROVIDERS[0].placeholder,
              },
              {
                label: "Gemini",
                value: geminiKey,
                set: setGeminiKey,
                placeholder: PROVIDERS[1].placeholder,
              },
              {
                label: "OpenRouter",
                value: openrouterKey,
                set: setOpenrouterKey,
                placeholder: PROVIDERS[2].placeholder,
              },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-widest mb-2.5">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={showKeys[label] ? "text" : "password"}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className={`${inputCls} pr-11`}
                  />
                  {value && (
                    <button
                      type="button"
                      onClick={() => toggleShow(label)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a3a] hover:text-[#a3a3a3] transition-colors"
                    >
                      {showKeys[label] ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <WizardInfoRow>
              <p className="text-[12px] text-[#3a3a3a]">
                Keys are stored encrypted. Leave any field blank to use Knight&apos;s built-in key for that provider.
              </p>
            </WizardInfoRow>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
