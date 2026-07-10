"use client";

import { useState } from "react";
import Link from "next/link";

type TelegramMode = "userbot" | "normal" | null;

export default function TelegramSetupPage() {
  const [mode, setMode] = useState<TelegramMode>(null);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
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

      setSuccess(true);
      setStep(mode === "userbot" ? 4 : 3);
    } catch (err: any) {
      setError(err.message || "Failed to connect Telegram");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/telegram" className="text-sm text-paper-400 hover:text-paper-200 transition-colors">
          ← Back to Telegram
        </Link>
      </div>

      <h1 className="font-display text-2xl text-paper-100 mb-2">Connect Telegram</h1>
      <p className="text-sm text-paper-400 mb-8">
        Choose how Knight connects to Telegram. Each option has different capabilities.
      </p>

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
            {mode === "userbot"
              ? "Your Telegram account is now connected. Knight will start finding leads in groups automatically."
              : "Your bot is now connected. Knight can respond to messages and handle conversations."}
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
      ) : !mode ? (
        /* Mode Selection */
        <div className="space-y-4">
          <h2 className="font-display text-lg text-paper-100 mb-4">Choose Connection Type</h2>

          {/* Userbot Option */}
          <button
            onClick={() => { setMode("userbot"); setStep(1); }}
            className="w-full text-left rounded-xl border border-line bg-ink-900 p-6 hover:border-flash-500/50 hover:bg-ink-800/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-flash-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg text-paper-100">Userbot (Personal Account)</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-flash-500/10 text-flash-500 font-medium">Recommended</span>
                </div>
                <p className="text-sm text-paper-400 mb-3">
                  Connect your personal Telegram account. Knight acts as you, finding and messaging leads directly.
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
                    <span>✓</span> Full conversation control
                  </div>
                  <div className="flex items-center gap-1.5 text-green-500">
                    <span>✓</span> Higher response rates
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-500">
                    <span>⚠</span> Requires phone number
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Normal Bot Option */}
          <button
            onClick={() => { setMode("normal"); setStep(1); }}
            className="w-full text-left rounded-xl border border-line bg-ink-900 p-6 hover:border-line hover:bg-ink-800/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-ink-800 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-paper-100 mb-1">Normal Bot (BotFather)</h3>
                <p className="text-sm text-paper-400 mb-3">
                  Create a Telegram bot. Simpler setup but limited to responding to messages.
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
                  <div className="flex items-center gap-1.5 text-green-500">
                    <span>✓</span> Handle conversations
                  </div>
                  <div className="flex items-center gap-1.5 text-paper-400">
                    <span>—</span> Cannot join groups
                  </div>
                  <div className="flex items-center gap-1.5 text-paper-400">
                    <span>—</span> Cannot find leads
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Comparison Table */}
          <div className="rounded-xl border border-line bg-ink-900 p-6 mt-6">
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
                  <td className="py-2">Handle conversations</td>
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
      ) : (
        /* Setup Steps */
        <form onSubmit={handleConnect} className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {mode === "userbot" ? (
              <>
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? "bg-flash-500 text-ink-950" : "bg-ink-800 text-paper-400"
                    }`}>
                      {step > s ? "✓" : s}
                    </div>
                    <span className={`text-sm ${step >= s ? "text-paper-200" : "text-paper-400"}`}>
                      {s === 1 ? "Phone" : s === 2 ? "Username" : "Verify"}
                    </span>
                    {s < 3 && <div className="w-8 h-px bg-line" />}
                  </div>
                ))}
              </>
            ) : (
              <>
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? "bg-flash-500 text-ink-950" : "bg-ink-800 text-paper-400"
                    }`}>
                      {step > s ? "✓" : s}
                    </div>
                    <span className={`text-sm ${step >= s ? "text-paper-200" : "text-paper-400"}`}>
                      {s === 1 ? "Bot Token" : "Username"}
                    </span>
                    {s < 2 && <div className="w-8 h-px bg-line" />}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* USERBOT STEPS */}
          {mode === "userbot" && step === 1 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 1: Phone Number</h2>
              <p className="text-sm text-paper-400 mb-4">
                Enter the phone number for your Telegram account. Knight will send you a verification code.
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
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => phone && setStep(2)}
                  disabled={!phone}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {mode === "userbot" && step === 2 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 2: Telegram Username</h2>
              <p className="text-sm text-paper-400 mb-4">
                Your Telegram username (without @). This is where Knight sends approval requests.
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

          {mode === "userbot" && step === 3 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 3: Verify Connection</h2>
              <p className="text-sm text-paper-400 mb-4">
                Click connect to send a verification code to your Telegram. Enter the code to complete setup.
              </p>

              <div className="rounded-lg bg-ink-950 border border-line p-4 mb-4">
                <p className="text-xs text-paper-400 mb-2">What happens next:</p>
                <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                  <li>Knight sends a verification code to your Telegram</li>
                  <li>Enter the code when prompted</li>
                  <li>Your account is securely connected</li>
                  <li>Knight starts finding leads automatically</li>
                </ol>
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

          {/* NORMAL BOT STEPS */}
          {mode === "normal" && step === 1 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 1: Create Bot</h2>
              <p className="text-sm text-paper-400 mb-4">
                Create a Telegram bot via @BotFather and paste the token here.
              </p>

              <div className="rounded-lg bg-ink-950 border border-line p-4 mb-4">
                <p className="text-xs text-paper-400 mb-2">How to create a bot:</p>
                <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                  <li>Open Telegram and search for @BotFather</li>
                  <li>Send /newbot</li>
                  <li>Enter a name for your bot (e.g., &quot;Knight Sales Bot&quot;)</li>
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
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => botToken && setStep(2)}
                  disabled={!botToken}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {mode === "normal" && step === 2 && (
            <div className="rounded-xl border border-line bg-ink-900 p-6">
              <h2 className="font-display text-lg text-paper-100 mb-4">Step 2: Bot Username</h2>
              <p className="text-sm text-paper-400 mb-4">
                Enter your bot&apos;s username (without @) for notifications.
              </p>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Bot Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_bot_username"
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
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  {loading ? "Connecting..." : "Connect Bot"}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
