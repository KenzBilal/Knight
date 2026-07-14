"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { HalftoneBackground } from "@/components/HalftoneBackground";

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

    toast.promise(promise, {
      loading: "Creating your account...",
      success: "Welcome to Knight!",
      error: err => err.message || "Signup failed",
    });
    promise.finally(() => setLoading(false));
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      <HalftoneBackground />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-neutral-900 font-semibold text-lg tracking-tight">
          Knight
        </Link>
        <p className="text-sm text-neutral-400">
          Have an account?{" "}
          <Link href="/auth/login" className="text-neutral-900 font-medium hover:underline underline-offset-2 transition-colors">
            Sign in
          </Link>
        </p>
      </header>

      {/* Center form */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-neutral-200/80 shadow-xl shadow-neutral-200/50 p-8">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-neutral-400 mt-1.5">
                Start your free trial — no credit card required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-wide uppercase text-neutral-400 select-none">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-wide uppercase text-neutral-400 select-none">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-wide uppercase text-neutral-400 select-none">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-neutral-900 text-white font-medium py-3 text-sm tracking-wide hover:bg-neutral-700 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-neutral-400 mt-6 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="hover:text-neutral-700 underline underline-offset-2 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="hover:text-neutral-700 underline underline-offset-2 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-5 border-t border-neutral-200/60 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">About</Link>
            <Link href="/contact" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">Contact</Link>
            <Link href="/privacy" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">Terms</Link>
            <Link href="/refund" className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">Refund</Link>
          </div>
          <span className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Knight. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
