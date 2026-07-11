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
      const payload: any = {
        telegram_mode: mode,
        telegram_username: username,
      };

      if (mode === "userbot") {
        payload.telegram_phone = phone;
      } else {
        payload.telegram_bot_token = botToken;
      }

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save Telegram config");

      toast.success("Telegram connected!");
      setCompleted(true);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect Telegram");
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
              ? "Your Telegram account is now connected. Knight will start finding leads in groups automatically."
              : "Your bot is now connected. Knight can respond to messages and handle conversations."
          }
          icon="📱"
          onContinue={() => router.push("/dashboard/telegram")}
          onSetupMore={() => router.push("/dashboard")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Telegram Setup"
      subtitle="Connect Telegram for lead discovery and management"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
    >
      {step === 0 && (
        <div className="space-y-4">
          <WizardCard
            title="Userbot (Personal Account)"
            description="Recommended — connects your personal Telegram"
            icon={<span className="text-2xl">📱</span>}
          >
            <div className="space-y-4">
              <p className="text-sm text-paper-300">
                Connect your personal Telegram account. Knight acts as you, finding and messaging leads directly
                in Telegram groups.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Join any Telegram group
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Find leads automatically
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Send DMs as yourself
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Higher response rates
                </div>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <span>⚠</span> Requires phone number
                </div>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <span>⚠</span> Uses your personal account
                </div>
              </div>
              <button
                onClick={() => selectMode("userbot")}
                className="w-full rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors active:scale-[0.98]"
              >
                Use Userbot
              </button>
            </div>
          </WizardCard>

          <WizardCard
            title="Normal Bot (BotFather)"
            description="Simpler setup — create a bot via @BotFather"
            icon={<span className="text-2xl">🤖</span>}
          >
            <div className="space-y-4">
              <p className="text-sm text-paper-300">
                Create a Telegram bot. Simpler setup but limited to responding to messages.
                Cannot join groups or find leads proactively.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Simple setup
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> No phone required
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <span>✓</span> Respond to messages
                </div>
                <div className="flex items-center gap-1.5 text-paper-400">
                  <span>—</span> Cannot join groups
                </div>
                <div className="flex items-center gap-1.5 text-paper-400">
                  <span>—</span> Cannot find leads
                </div>
                <div className="flex items-center gap-1.5 text-paper-400">
                  <span>—</span> Limited capabilities
                </div>
              </div>
              <button
                onClick={() => selectMode("normal")}
                className="w-full rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Use Normal Bot
              </button>
            </div>
          </WizardCard>

          {/* Comparison Table */}
          <div className="rounded-xl border border-line bg-ink-900 p-6">
            <h3 className="font-display text-sm text-paper-100 mb-4">Feature Comparison</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 text-paper-400 font-medium">Feature</th>
                  <th className="text-center py-2 text-flash-500 font-medium">Userbot</th>
                  <th className="text-center py-2 text-paper-400 font-medium">Normal Bot</th>
                </tr>
              </thead>
              <tbody className="text-paper-300">
                <tr className="border-b border-line/50">
                  <td className="py-2">Find leads in groups</td>
                  <td className="text-center py-2 text-green-500">✓</td>
                  <td className="text-center py-2 text-paper-400">✗</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">Send first DM</td>
                  <td className="text-center py-2 text-green-500">✓</td>
                  <td className="text-center py-2 text-paper-400">✗</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">Auto-join groups</td>
                  <td className="text-center py-2 text-green-500">✓</td>
                  <td className="text-center py-2 text-paper-400">✗</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">Reply to messages</td>
                  <td className="text-center py-2 text-green-500">✓</td>
                  <td className="text-center py-2 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">Response rate</td>
                  <td className="text-center py-2 text-green-500">High</td>
                  <td className="text-center py-2 text-yellow-500">Medium</td>
                </tr>
                <tr>
                  <td className="py-2">Setup difficulty</td>
                  <td className="text-center py-2 text-yellow-500">Medium</td>
                  <td className="text-center py-2 text-green-500">Easy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 1 && mode === "userbot" && (
        <WizardCard
          title="Phone Number"
          description="Enter your Telegram account phone number"
          icon={<span className="text-2xl">📞</span>}
        >
          <form onSubmit={e => { e.preventDefault(); username && setStep(2); }} className="space-y-4">
            <div>
              <label className="block text-sm text-paper-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <p className="text-xs text-paper-500 mt-1">
                Knight will send a verification code to this number
              </p>
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">Telegram Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <p className="text-xs text-paper-500 mt-1">
                Without the @ — used for approval notifications
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!phone || !username}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 1 && mode === "normal" && (
        <WizardCard
          title="Create Your Bot"
          description="Create a bot via @BotFather and paste the token"
          icon={<span className="text-2xl">🤖</span>}
        >
          <form onSubmit={e => { e.preventDefault(); botToken && setStep(2); }} className="space-y-4">
            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">How to create a bot:</p>
              <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                <li>Send <code className="text-flash-500">/newbot</code></li>
                <li>Enter a name (e.g., &quot;Knight Sales Bot&quot;)</li>
                <li>Enter a username (must end with &quot;bot&quot;)</li>
                <li>Copy the API token</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">Bot Token</label>
              <input
                type="text"
                required
                value={botToken}
                onChange={e => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">Bot Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_bot_username"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!botToken || !username}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </form>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Verify Connection"
          description={mode === "userbot" ? "Complete the verification process" : "Connect your bot to Knight"}
          icon={<span className="text-2xl">✓</span>}
        >
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">What happens next:</p>
              <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                {mode === "userbot" ? (
                  <>
                    <li>Knight sends a verification code to your Telegram</li>
                    <li>Enter the code when prompted</li>
                    <li>Your account is securely connected</li>
                    <li>Knight starts finding leads automatically</li>
                  </>
                ) : (
                  <>
                    <li>Knight connects to your bot</li>
                    <li>Your bot starts receiving messages</li>
                    <li>Knight responds to inquiries automatically</li>
                    <li>You manage conversations from the dashboard</li>
                  </>
                )}
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  mode === "userbot" ? "Connect Telegram" : "Connect Bot"
                )}
              </button>
            </div>
          </form>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
