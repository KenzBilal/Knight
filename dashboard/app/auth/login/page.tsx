"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const promise = fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const inviteToken = searchParams.get("invite_token");
      if (inviteToken) {
        router.push(`/api/team/accept?token=${inviteToken}`);
      } else {
        router.push(searchParams.get("redirect") || "/dashboard");
      }
      return data;
    });

    toast.promise(promise, { loading: "Signing in...", success: "Welcome back!", error: err => err.message || "Login failed" });
    promise.finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-[12px] font-medium text-[#6b6b6b] tracking-wide">
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-150 focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] hover:border-[#ccc]"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[12px] font-medium text-[#6b6b6b] tracking-wide">
            Password
          </label>
          <Link href="/auth/reset" className="text-[12px] text-[#888] hover:text-[#111] transition-colors">
            Forgot?
          </Link>
        </div>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-150 focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] hover:border-[#ccc]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 rounded-xl bg-[#111] text-white font-semibold py-3 text-[15px] tracking-tight transition-all duration-150 hover:bg-[#222] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Form area — centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-12 lg:px-14">
          <div className="w-full max-w-[360px]">
              <div className="mb-8">
                <h1 className="text-[28px] md:text-[32px] font-display font-semibold text-[#111] tracking-tight leading-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#888] leading-relaxed">
                  Sign in to your dashboard to continue.
                </p>
              </div>

              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-5 w-5 text-[#ccc]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              }>
                <LoginForm />
              </Suspense>

              <p className="mt-6 text-center text-[13px] text-[#aaa]">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-[#111] font-semibold hover:underline underline-offset-4">
                  Create one free
                </Link>
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
