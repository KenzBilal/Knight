"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

type TelegramMode = "userbot" | "normal" | null;

const STEPS = [
  { id: "choose", title: "Choose Type" },
  { id: "connect", title: "Connect" },
  { id: "verify", title: "Verify" },
  { id: "done", title: "Done" },
];

export default function TelegramWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<TelegramMode>(null);
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { telegram_mode: mode, telegram_username: username };
      if (mode === "userbot") payload.telegram_phone = phone;
      else payload.telegram_bot_token = botToken;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Telegram connected!");
      setCompleted(true);
      setStep(3);
    } catch (err: any) { toast.error(err.message || "Failed"); } finally { setLoading(false); }
  }

  function selectMode(selected: TelegramMode) { setMode(selected); setStep(1); }

  if (completed) {
    return (
      <WizardLayout title="Telegram Setup" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
        <WizardComplete title="Telegram Connected!" description={mode === "userbot" ? "Your account is connected. Knight will find leads automatically." : "Your bot is connected."}
          icon="📱" onContinue={() => router.push("/dashboard/telegram")} onSetupMore={() => router.push("/dashboard")} />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout title="Telegram Setup" subtitle="Connect for lead discovery" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
      {step === 0 && (
        <div className="space-y-4">
          <WizardCard title="Userbot (Recommended)" description="Connect your personal account" icon={<span className="text-2xl">📱</span>}>
            <div className="space-y-4">
              <p className="text-sm text-[#a3a3a3]">Knight joins groups, finds leads, and sends DMs as you.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#4ade80]"><span>✓</span> Join any group</div>
                <div className="flex items-center gap-1.5 text-[#4ade80]"><span>✓</span> Find leads automatically</div>
                <div className="flex items-center gap-1.5 text-[#4ade80]"><span>✓</span> Higher response rates</div>
                <div className="flex items-center gap-1.5 text-[#fbbf24]"><span>⚠</span> Requires phone number</div>
              </div>
              <button onClick={() => selectMode("userbot")}
                className="w-full rounded-xl bg-white text-[#080808] font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors active:scale-[0.98]">
                Use Userbot
              </button>
            </div>
          </WizardCard>

          <WizardCard title="Normal Bot" description="Create via @BotFather" icon={<span className="text-2xl">🤖</span>}>
            <div className="space-y-4">
              <p className="text-sm text-[#a3a3a3]">Simpler setup but limited to responding to messages.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#4ade80]"><span>✓</span> Simple setup</div>
                <div className="flex items-center gap-1.5 text-[#4ade80]"><span>✓</span> No phone required</div>
                <div className="flex items-center gap-1.5 text-[#525252]"><span>—</span> Cannot join groups</div>
                <div className="flex items-center gap-1.5 text-[#525252]"><span>—</span> Cannot find leads</div>
              </div>
              <button onClick={() => selectMode("normal")}
                className="w-full rounded-xl border border-white/[0.12] text-[#a3a3a3] font-medium px-5 py-2.5 text-sm hover:bg-white/[0.04] hover:text-white transition-colors">
                Use Normal Bot
              </button>
            </div>
          </WizardCard>
        </div>
      )}

      {step === 1 && mode === "userbot" && (
        <WizardCard title="Phone Number" description="Enter your Telegram phone" icon={<span className="text-2xl">📞</span>}>
          <form onSubmit={e => { e.preventDefault(); if (username) setStep(2); }} className="space-y-4">
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">Phone Number</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                className="w-full input-base rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username"
                className="w-full input-base rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-white/[0.12] text-[#a3a3a3] font-medium px-5 py-2.5 text-sm hover:bg-white/[0.04] hover:text-white transition-colors">Back</button>
              <button type="submit" disabled={!phone || !username} className="rounded-xl bg-white text-[#080808] font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors disabled:opacity-50 active:scale-[0.98]">Continue</button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 1 && mode === "normal" && (
        <WizardCard title="Create Bot" description="Get token from @BotFather" icon={<span className="text-2xl">🤖</span>}>
          <form onSubmit={e => { e.preventDefault(); if (botToken) setStep(2); }} className="space-y-4">
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
              <p className="text-xs text-[#525252] mb-2">How to create:</p>
              <ol className="text-xs text-[#a3a3a3] space-y-1 list-decimal list-inside">
                <li>Search <strong className="text-white">@BotFather</strong> on Telegram</li>
                <li>Send <code className="text-[#4ade80]">/newbot</code></li>
                <li>Enter name and username</li>
                <li>Copy the token</li>
              </ol>
            </div>
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">Bot Token</label>
              <input type="text" required value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="123456789:ABCdef..."
                className="w-full input-base rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">Bot Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="your_bot_username"
                className="w-full input-base rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-white/[0.12] text-[#a3a3a3] font-medium px-5 py-2.5 text-sm hover:bg-white/[0.04] hover:text-white transition-colors">Back</button>
              <button type="submit" disabled={!botToken || !username} className="rounded-xl bg-white text-[#080808] font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors disabled:opacity-50 active:scale-[0.98]">Continue</button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard title="Verify Connection" description="Complete the setup" icon={<span className="text-2xl">✓</span>}>
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
              <p className="text-xs text-[#525252] mb-2">What happens next:</p>
              <ol className="text-xs text-[#a3a3a3] space-y-1 list-decimal list-inside">
                {mode === "userbot" ? (<>
                  <li>Knight sends a verification code</li><li>Enter the code when prompted</li><li>Your account is connected</li>
                </>) : (<>
                  <li>Knight connects to your bot</li><li>Bot starts receiving messages</li><li>Knight responds automatically</li>
                </>)}
              </ol>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-white/[0.12] text-[#a3a3a3] font-medium px-5 py-2.5 text-sm hover:bg-white/[0.04] hover:text-white transition-colors">Back</button>
              <button type="submit" disabled={loading}
                className="rounded-xl bg-white text-[#080808] font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center gap-2">
                {loading ? (<><div className="w-4 h-4 border-2 border-[#080808]/30 border-t-[#080808] rounded-full animate-spin" />Connecting...</>) : (mode === "userbot" ? "Connect Telegram" : "Connect Bot")}
              </button>
            </div>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
