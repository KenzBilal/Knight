"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TelegramSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Save Telegram config to org_config
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_phone: phone,
          telegram_username: username,
          telegram_bot_token: botToken || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save Telegram config");
      }

      setSuccess(true);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to connect Telegram");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/telegram" className="text-sm text-paper-400 hover:text-paper-200 transition-colors">
          ← Back to Telegram
        </Link>
      </div>

      <h1 className="font-display text-2xl text-paper-100 mb-2">Connect Telegram</h1>
      <p className="text-sm text-paper-400 mb-8">
        Set up Telegram to find leads in groups and handle conversations automatically.
      </p>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? "bg-flash-500 text-ink-950" : "bg-ink-800 text-paper-400"
            }`}>
              {step > s ? "✓" : s}
            </div>
            <span className={`text-sm ${step >= s ? "text-paper-200" : "text-paper-400"}`}>
              {s === 1 ? "Phone" : s === 2 ? "Username" : "Bot Token"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-line" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-500 mb-6">
          {error}
        </div>
      )}

      {success ? (
        <div className="rounded-xl border border-line bg-ink-900 p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="font-display text-xl text-paper-100 mb-2">Telegram Connected!</h2>
          <p className="text-sm text-paper-400 mb-6">
            Your Telegram account is now connected. Knight will start finding leads in groups and handling conversations.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/telegram"
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors"
            >
              View Telegram Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-6">
          {/* Step 1: Phone Number */}
          {step === 1 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 1: Phone Number</h2>
              <p className="text-sm text-paper-400 mb-4">
                Enter the phone number associated with your Telegram account. This is used to connect your personal Telegram account to Knight.
              </p>
              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>
              <button
                type="button"
                onClick={() => phone && setStep(2)}
                disabled={!phone}
                className="mt-4 rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Username */}
          {step === 2 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 2: Telegram Username</h2>
              <p className="text-sm text-paper-400 mb-4">
                Your Telegram username (without @) for notifications. This is where Knight will send approval requests.
              </p>
              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => username && setStep(3)}
                  disabled={!username}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bot Token (Optional) */}
          {step === 3 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 3: Bot Token (Optional)</h2>
              <p className="text-sm text-paper-400 mb-4">
                Create a Telegram bot via @BotFather and enter the token here. This enables inline approve/decline buttons in Telegram.
              </p>
              
              <div className="rounded-lg bg-ink-950 border border-line p-4 mb-4">
                <p className="text-xs text-paper-400 mb-2">How to create a bot:</p>
                <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                  <li>Open Telegram and search for @BotFather</li>
                  <li>Send /newbot</li>
                  <li>Enter a name for your bot</li>
                  <li>Enter a username (must end with &quot;bot&quot;)</li>
                  <li>Copy the API token</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Bot Token</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  {loading ? "Connecting..." : "Connect Telegram"}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Info Box */}
      <div className="mt-8 rounded-xl border border-line bg-ink-900 p-6">
        <h3 className="font-display text-sm text-paper-100 mb-2">How it works</h3>
        <ul className="text-xs text-paper-400 space-y-1">
          <li>• Knight connects to your Telegram account via MTProto</li>
          <li>• It finds business owners in Telegram groups</li>
          <li>• Sends personalized DMs and handles conversations</li>
          <li>• You get notified to approve/decline deals</li>
          <li>• Your session is encrypted and stored securely</li>
        </ul>
      </div>
    </div>
  );
}
