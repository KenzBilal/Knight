"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function TelegramSetupPage() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      toast.success("Code sent");
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
        throw new Error(data.error || "Failed to verify");
      }

      toast.success("Telegram connected!");
      fetch("/api/telegram/auth/confirm", { method: "POST" }).catch(() => {});
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/telegram" className="text-sm text-[#525252] hover:text-[#a3a3a3] transition-colors">
          ← Back to Telegram
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-white mb-2">Connect Telegram</h1>
      <p className="text-sm text-[#525252] mb-8">
        Link your personal Telegram account. Knight acts as you to find and message leads in groups.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {success ? (
        <div className="dash-card p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-lg font-semibold text-white mb-2">Telegram Connected!</h2>
          <p className="text-sm text-[#525252] mb-6">
            Your account is linked. Knight will start finding leads automatically.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/telegram"
              className="rounded-lg bg-white text-black font-medium px-5 py-2.5 text-sm hover:bg-white/90 transition-colors"
            >
              View Telegram
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 text-[#a3a3a3] font-medium px-5 py-2.5 text-sm hover:bg-white/5 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="dash-card p-6">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {[0, 1].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= s ? "bg-white text-black" : "bg-white/10 text-[#525252]"
                }`}>
                  {s + 1}
                </div>
                {s < 1 && <div className={`w-8 h-px ${step > s ? "bg-white" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Phone */}
          {step === 0 && (
            <form onSubmit={handleStart}>
              <h2 className="text-sm font-medium text-white mb-1">Phone number</h2>
              <p className="text-[11px] text-[#525252] mb-4">
                Enter the phone number linked to your Telegram account.
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full input-base rounded-lg px-4 py-3 text-sm mb-4"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full rounded-xl bg-white text-black font-medium px-4 py-3 text-sm hover:bg-white/90 disabled:opacity-40 transition-colors"
              >
                {loading ? "Sending code..." : "Send Code"}
              </button>
            </form>
          )}

          {/* Step 2: Code or Password */}
          {step === 1 && !needsPassword && (
            <form onSubmit={handleVerify}>
              <h2 className="text-sm font-medium text-white mb-1">Verification code</h2>
              <p className="text-[11px] text-[#525252] mb-4">
                Check Telegram for the code sent by Knight.
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                className="w-full input-base rounded-lg px-4 py-3 text-sm font-mono mb-4"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !code}
                className="w-full rounded-xl bg-white text-black font-medium px-4 py-3 text-sm hover:bg-white/90 disabled:opacity-40 transition-colors"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}

          {needsPassword && (
            <form onSubmit={handleVerify}>
              <h2 className="text-sm font-medium text-white mb-1">Two-factor password</h2>
              <p className="text-[11px] text-[#525252] mb-4">
                Your account has 2FA enabled.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full input-base rounded-lg px-4 py-3 text-sm mb-4"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full rounded-xl bg-white text-black font-medium px-4 py-3 text-sm hover:bg-white/90 disabled:opacity-40 transition-colors"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
