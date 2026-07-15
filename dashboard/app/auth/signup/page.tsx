"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";
import { AuthHero } from "@/components/AuthHero";
import { KnightLogo } from "@/components/KnightLogo";

// ─── All logic unchanged ────────────────────────────────────────────────────

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
      router.push("/dashboard");
      return data;
    });

    toast.promise(promise, { loading: "Creating your account...", success: "Welcome to Knight!", error: err => err.message || "Signup failed" });
    promise.finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen flex lg:flex-row-reverse">
      {/* ── Left hero (hidden on mobile) ──────────────── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] flex-shrink-0">
        <AuthHero mode="signup" />
      </div>

      {/* ── Left auth panel ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile top brand */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <KnightLogo href="/" variant="light" size={26} />
          <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium">
            Sign in
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-14 xl:px-20 py-12">
          <div className="w-full max-w-[380px] mx-auto">

            <FadeIn>
              <div className="mb-10">
                {/* Desktop logo */}
                <KnightLogo href="/" variant="light" size={26} className="mb-10" />

                <h2 className="text-[28px] sm:text-[32px] font-semibold text-neutral-900 tracking-tight leading-tight">
                  Start for free
                </h2>
                <p className="mt-2 text-[15px] text-neutral-500 leading-relaxed">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </FadeIn>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FadeIn delay={100}>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 hover:border-neutral-300"
                  />
                </div>
              </FadeIn>

              <FadeIn delay={150}>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                    Work email
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

              <FadeIn delay={250}>
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
                      Creating account…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create account
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </FadeIn>
            </form>

            <FadeIn delay={300}>
              <div className="mt-8 pt-7 border-t border-neutral-100">
                <p className="text-[14px] text-neutral-500 text-center">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-neutral-900 font-semibold hover:underline underline-offset-4 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <p className="mt-5 text-[11px] text-neutral-400 text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="hover:text-neutral-600 underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="hover:text-neutral-600 underline underline-offset-2">Privacy Policy</Link>
              </p>
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
