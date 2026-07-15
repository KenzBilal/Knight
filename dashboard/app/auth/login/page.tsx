"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";
import { AuthHero } from "@/components/AuthHero";

// ─── All logic unchanged ────────────────────────────────────────────────────

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
      <FadeIn delay={100}>
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 hover:border-neutral-300"
          />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="min. 8 characters"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 hover:border-neutral-300"
          />
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <button
          type="submit"
          disabled={loading}
          className="group w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 text-[15px] tracking-wide transition-all duration-200 hover:bg-neutral-700 active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/25 mt-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign in
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>
      </FadeIn>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left hero (hidden on mobile) ──────────────── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] flex-shrink-0">
        <AuthHero mode="login" />
      </div>

      {/* ── Right auth panel ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile top brand */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <Link href="/" className="font-display text-lg font-semibold text-neutral-900 tracking-tight">
            Knight
          </Link>
          <Link href="/auth/signup" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium">
            Sign up
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-14 xl:px-20 py-12">
          <div className="w-full max-w-[380px] mx-auto">

            <FadeIn>
              <div className="mb-10">
                {/* Desktop logo */}
                <Link href="/" className="hidden lg:inline-flex items-center gap-2 mb-10 group">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center transition-transform duration-200 group-hover:scale-95">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                      <path d="M10 2L13 8H17L13.5 12L15 18L10 15L5 18L6.5 12L3 8H7L10 2Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-neutral-900 text-base tracking-tight">Knight</span>
                </Link>

                <h2 className="text-[28px] sm:text-[32px] font-semibold text-neutral-900 tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="mt-2 text-[15px] text-neutral-500 leading-relaxed">
                  Sign in to your dashboard and pick up where you left off.
                </p>
              </div>
            </FadeIn>

            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-5 w-5 text-neutral-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            }>
              <LoginForm />
            </Suspense>

            <FadeIn delay={400}>
              <div className="mt-8 pt-7 border-t border-neutral-100">
                <p className="text-[14px] text-neutral-500 text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup" className="text-neutral-900 font-semibold hover:underline underline-offset-4 transition-colors">
                    Create one free
                  </Link>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <FadeIn delay={500}>
          <footer className="px-8 sm:px-12 lg:px-14 xl:px-20 py-6 border-t border-neutral-100">
            <div className="w-full max-w-[380px] mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors">Terms</Link>
                <Link href="/refund" className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors">Refund</Link>
                <Link href="/contact" className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors">Contact</Link>
              </div>
              <span className="text-[11px] text-neutral-400">
                &copy; {new Date().getFullYear()} Knight
              </span>
            </div>
          </footer>
        </FadeIn>
      </div>
    </div>
  );
}
