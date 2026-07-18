"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "phone", title: "Phone" },
  { id: "verify", title: "Verify" },
  { id: "done", title: "Done" },
];

export default function TelegramWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(d => {
        if (!d.company_name) router.replace("/dashboard/wizard");
      })
      .catch(() => {});
  }, [router]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Code sent to your Telegram");
      setStep(1);
    } catch (err: any) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = { phone, code };
      if (password) body.password = password;

      const res = await fetch("/api/telegram/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "SESSION_PASSWORD_NEEDED") {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error);
      }

      toast.success("Telegram connected!");
      fetch("/api/telegram/auth/confirm", { method: "POST" }).catch(() => {});
      setCompleted(true);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <WizardLayout
        title="Telegram Setup"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Telegram Connected!"
          description="Your account is linked. Knight will start finding leads in Telegram groups automatically."
          onContinue={() => router.push("/dashboard/telegram")}
          onSetupMore={() => router.push("/dashboard")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Telegram Setup"
      subtitle="Connect your account for lead discovery"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      hideNext
    >
      {/* Step 0: Phone */}
      {step === 0 && (
        <WizardCard
          title="Enter your phone number"
          description="Telegram will send a verification code to your account."
        >
          <form onSubmit={handleStart} className="space-y-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full input-base rounded-lg px-4 py-3 text-sm"
              required
              autoFocus
            />
            <p className="text-[11px] text-[#3a3a3a]">
              We never store your phone number. It&apos;s only used to send the verification code.
            </p>
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        </WizardCard>
      )}

      {/* Step 1: Code */}
      {step === 1 && !needsPassword && (
        <WizardCard
          title="Enter verification code"
          description="Check your Telegram for the code from Knight."
        >
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345"
              className="w-full input-base rounded-lg px-4 py-3 text-sm font-mono"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !code}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </WizardCard>
      )}

      {/* Step 1b: 2FA Password */}
      {needsPassword && (
        <WizardCard
          title="Two-factor authentication"
          description="Your account has 2FA enabled. Enter your password."
        >
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your 2FA password"
              className="w-full input-base rounded-lg px-4 py-3 text-sm"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
