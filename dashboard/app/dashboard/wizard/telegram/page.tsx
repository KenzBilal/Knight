"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

type TelegramMode = "userbot" | "normal" | null;

const STEPS = [
  { id: "choose", title: "Choose" },
  { id: "connect", title: "Connect" },
  { id: "verify", title: "Verify" },
  { id: "done", title: "Done" },
];

export default function TelegramWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<TelegramMode>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      toast.success("Code sent! Check your Telegram.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify");
      toast.success("Telegram connected!");
      setCompleted(true);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectBot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_mode: "normal",
          telegram_bot_token: botToken,
          telegram_username: username,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Bot connected!");
      setCompleted(true);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  function selectMode(selected: TelegramMode) {
    setMode(selected);
    setStep(1);
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
          description={
            mode === "userbot"
              ? "Your account is connected. Knight will find leads automatically."
              : "Your bot is connected and ready to receive messages."
          }
          icon={
            <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onContinue={() => router.push("/dashboard/telegram")}
          onSetupMore={() => router.push("/dashboard")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Telegram Setup"
      subtitle="Connect for lead discovery"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      hideNext={step === 0 || step === 1 || step === 2}
    >
      {step === 0 && (
        <div className="space-y-4">
          <WizardCard
            title="Userbot"
            description="Recommended for full capabilities"
            icon={
              <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            }
          >
            <p className="text-[13px] text-[#525252] mb-5 leading-relaxed">
              Connect your personal Telegram account. Knight acts as you,
              finding and messaging leads directly.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Join any Telegram group</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Find leads automatically</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Higher response rates</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#fbbf24]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#fbbf24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Requires phone number</span>
              </div>
            </div>
            <button
              onClick={() => selectMode("userbot")}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              Use Userbot
            </button>
          </WizardCard>

          <WizardCard
            title="Bot"
            description="Create via @BotFather"
            icon={
              <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            }
          >
            <p className="text-[13px] text-[#525252] mb-5 leading-relaxed">
              Create a Telegram bot. Simpler setup but limited to responding
              to messages.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Simple setup</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">No phone required</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#3a3a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </div>
                <span className="text-[#3a3a3a]">Cannot join groups</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#3a3a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </div>
                <span className="text-[#3a3a3a]">Cannot find leads</span>
              </div>
            </div>
            <button
              onClick={() => selectMode("normal")}
              className="w-full rounded-xl border border-white/[0.08] text-[#a3a3a3] font-medium text-[13px] py-3 transition-all duration-200 hover:bg-white/[0.03] hover:text-white hover:border-white/[0.12]"
            >
              Use Bot
            </button>
          </WizardCard>
        </div>
      )}

      {step === 1 && mode === "userbot" && (
        <WizardCard
          title="Phone Number"
          description="Enter your Telegram phone"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
            </svg>
          }
        >
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                How it works
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Enter your Telegram phone number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Telegram sends you an SMS code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Enter the code to verify</span>
                </li>
              </ol>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-[13px] font-medium text-[#525252] hover:text-white transition-colors px-4 py-2.5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!phone || loading}
                className="flex-1 rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Code"
                )}
              </button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 1 && mode === "normal" && (
        <WizardCard
          title="Create Bot"
          description="Get token from @BotFather"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        >
          <form onSubmit={handleConnectBot} className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                How to create
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">1.</span>
                  <span>Search <strong className="text-white">@BotFather</strong> on Telegram</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">2.</span>
                  <span>Send <code className="text-[#4ade80] bg-[#4ade80]/5 px-1.5 py-0.5 rounded">/newbot</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">3.</span>
                  <span>Enter name and username</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">4.</span>
                  <span>Copy the token</span>
                </li>
              </ol>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Bot Token
              </label>
              <input
                type="text"
                required
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdef..."
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200 font-mono text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Bot Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_bot_username"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-[13px] font-medium text-[#525252] hover:text-white transition-colors px-4 py-2.5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!botToken || !username || loading}
                className="flex-1 rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Bot"
                )}
              </button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Enter Code"
          description="Check your Telegram for the SMS code"
          icon={
            <svg className="w-5 h-5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        >
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                Instructions
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Open your Telegram app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Find the SMS with your verification code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span>Enter it below to connect</span>
                </li>
              </ol>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200 font-mono text-[15px] tracking-[0.3em] text-center"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[13px] font-medium text-[#525252] hover:text-white transition-colors px-4 py-2.5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!code || loading}
                className="flex-1 rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Connect"
                )}
              </button>
            </div>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
