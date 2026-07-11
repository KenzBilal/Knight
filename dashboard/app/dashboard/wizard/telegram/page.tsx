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
              <p className="text-sm text-neutral-400">Knight joins groups, finds leads, and sends DMs as you.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-green-500"><span>✓</span> Join any group</div>
                <div className="flex items-center gap-1.5 text-green-500"><span>✓</span> Find leads automatically</div>
                <div className="flex items-center gap-1.5 text-green-500"><span>✓</span> Higher response rates</div>
                <div className="flex items-center gap-1.5 text-yellow-500"><span>⚠</span> Requires phone number</div>
              </div>
              <button onClick={() => selectMode("userbot")}
                className="w-full rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors active:scale-[0.98]">
                Use Userbot
              </button>
            </div>
          </WizardCard>

          <WizardCard title="Normal Bot" description="Create via @BotFather" icon={<span className="text-2xl">🤖</span>}>
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Simpler setup but limited to responding to messages.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-green-500"><span>✓</span> Simple setup</div>
                <div className="flex items-center gap-1.5 text-green-500"><span>✓</span> No phone required</div>
                <div className="flex items-center gap-1.5 text-neutral-500"><span>—</span> Cannot join groups</div>
                <div className="flex items-center gap-1.5 text-neutral-500"><span>—</span> Cannot find leads</div>
              </div>
              <button onClick={() => selectMode("normal")}
                className="w-full rounded-lg border border-neutral-700 text-neutral-300 font-medium px-5 py-2.5 text-sm hover:bg-neutral-800 transition-colors">
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
              <label className="block text-sm text-neutral-400 mb-1.5">Phone Number</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="rounded-lg border border-neutral-700 text-neutral-300 font-medium px-5 py-2.5 text-sm hover:bg-neutral-800 transition-colors">Back</button>
              <button type="submit" disabled={!phone || !username} className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors disabled:opacity-50 active:scale-[0.98]">Continue</button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 1 && mode === "normal" && (
        <WizardCard title="Create Bot" description="Get token from @BotFather" icon={<span className="text-2xl">🤖</span>}>
          <form onSubmit={e => { e.preventDefault(); if (botToken) setStep(2); }} className="space-y-4">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-2">How to create:</p>
              <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                <li>Search <strong>@BotFather</strong> on Telegram</li>
                <li>Send <code className="text-paper-100">/newbot</code></li>
                <li>Enter name and username</li>
                <li>Copy the token</li>
              </ol>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Bot Token</label>
              <input type="text" required value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="123456789:ABCdef..."
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Bot Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="your_bot_username"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="rounded-lg border border-neutral-700 text-neutral-300 font-medium px-5 py-2.5 text-sm hover:bg-neutral-800 transition-colors">Back</button>
              <button type="submit" disabled={!botToken || !username} className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors disabled:opacity-50 active:scale-[0.98]">Continue</button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard title="Verify Connection" description="Complete the setup" icon={<span className="text-2xl">✓</span>}>
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-2">What happens next:</p>
              <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                {mode === "userbot" ? (<>
                  <li>Knight sends a verification code</li><li>Enter the code when prompted</li><li>Your account is connected</li>
                </>) : (<>
                  <li>Knight connects to your bot</li><li>Bot starts receiving messages</li><li>Knight responds automatically</li>
                </>)}
              </ol>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-neutral-700 text-neutral-300 font-medium px-5 py-2.5 text-sm hover:bg-neutral-800 transition-colors">Back</button>
              <button type="submit" disabled={loading}
                className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center gap-2">
                {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Connecting...</>) : (mode === "userbot" ? "Connect Telegram" : "Connect Bot")}
              </button>
            </div>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
