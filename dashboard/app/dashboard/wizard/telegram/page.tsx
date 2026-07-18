"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete, WizardInfoRow } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "phone", title: "Phone" },
  { id: "verify", title: "Verify" },
  { id: "done", title: "Done" },
];

const inputCls =
  "w-full rounded-xl bg-[#0a0a0a] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.22] focus:ring-2 focus:ring-white/[0.04] transition-all duration-200";

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
      .then((r) => r.json())
      .then((d) => {
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
        if (data.error === "2FA_PASSWORD_REQUIRED" || data.error === "SESSION_PASSWORD_NEEDED") {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || data.message || "Verification failed");
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
          description="Your account is linked. Knight will automatically discover high-intent leads from Telegram groups."
          onContinue={() => router.push("/dashboard/telegram")}
          onSetupMore={() => router.push("/dashboard")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Telegram Setup"
      subtitle="Connect your account for automated lead discovery from Telegram groups"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      hideNext
    >
      {/* ── Step 0: Phone ── */}
      {step === 0 && (
        <WizardCard
          title="Enter your phone number"
          description="Telegram will send a verification code to your account"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
            </svg>
          }
        >
          <form onSubmit={handleStart} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-widest mb-2.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className={inputCls}
                required
                autoFocus
              />
            </div>

            <WizardInfoRow>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#525252] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p className="text-[12px] text-[#3a3a3a] leading-relaxed">
                  Your phone number is only used to authenticate with Telegram. It is never stored or shared.
                </p>
              </div>
            </WizardInfoRow>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[14px] py-3.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                  Sending Code...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        </WizardCard>
      )}

      {/* ── Step 1: Code ── */}
      {step === 1 && !needsPassword && (
        <WizardCard
          title="Enter verification code"
          description="Check your Telegram app for the 5-digit code"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
            </svg>
          }
        >
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-widest mb-2.5">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="1 2 3 4 5"
                className={`${inputCls} tracking-[0.5em] text-center text-[18px] font-mono`}
                required
                autoFocus
                maxLength={6}
              />
              <p className="text-[11px] text-[#2a2a2a] text-center mt-2">
                Sent to {phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[14px] py-3.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep(0); setCode(""); }}
              className="w-full text-[12px] text-[#2a2a2a] hover:text-[#525252] transition-colors text-center py-1"
            >
              ← Use a different number
            </button>
          </form>
        </WizardCard>
      )}

      {/* ── Step 1b: 2FA ── */}
      {needsPassword && (
        <WizardCard
          title="Two-factor authentication"
          description="Your account has 2FA enabled"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        >
          <form onSubmit={handleVerify} className="space-y-5">
            <WizardInfoRow>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#fbbf24] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-[12px] text-[#525252] leading-relaxed">
                  Enter your Telegram 2FA cloud password to complete authentication.
                </p>
              </div>
            </WizardInfoRow>

            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-widest mb-2.5">
                2FA Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your 2FA password"
                className={inputCls}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[14px] py-3.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify Password"
              )}
            </button>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
