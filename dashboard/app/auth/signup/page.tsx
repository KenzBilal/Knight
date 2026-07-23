"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const promise = fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // PostHog: Identify user after signup
      if (data.user) {
        posthog.identify(data.user.id, {
          email: data.user.email,
          name: name,
        });
        posthog.capture("user_signed_up", { method: "password" });
        posthog.flush();
      }

      router.push("/dashboard");
      return data;
    });

    toast.promise(promise, {
      loading: "Creating your account...",
      success: () => "Welcome to Knight!",
      error: (err) => err.message || "Signup failed",
      style: {
        background: "rgba(17, 17, 17, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        padding: "12px 16px",
      },
    });
    promise.finally(() => setLoading(false));
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Form area — centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-12 lg:px-14">
          <div className="w-full max-w-[360px]">
              <div className="mb-8">
                <h1 className="text-[28px] md:text-[32px] font-display font-semibold text-[#111] tracking-tight leading-tight mb-2">
                  Start for free
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#888] leading-relaxed">
                  No credit card required. Cancel anytime.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#6b6b6b] tracking-wide">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full rounded-xl border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-200 ease-out focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] hover:border-[#ccc] hover:shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#6b6b6b] tracking-wide">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-200 ease-out focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] hover:border-[#ccc] hover:shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#6b6b6b] tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-200 ease-out focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] hover:border-[#ccc] hover:shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-[#111] text-white font-semibold py-3.5 text-[15px] tracking-tight transition-all duration-200 ease-out hover:bg-[#222] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-[#aaa]">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#111] font-semibold hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
              <p className="mt-4 text-center text-[11px] text-[#ccc] leading-relaxed">
                By signing up you agree to our{" "}
                <Link href="/terms" className="hover:text-[#888] underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="hover:text-[#888] underline underline-offset-2">Privacy Policy</Link>
              </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 md:py-6 flex items-center gap-5 border-t border-[#f0f0f0]">
          <Link href="/privacy" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Privacy</Link>
          <Link href="/terms" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Terms</Link>
          <Link href="/contact" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Contact</Link>
        </div>
    </div>
  );
}
