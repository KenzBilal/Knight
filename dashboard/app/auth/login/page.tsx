"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";

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
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
      return data;
    });

    toast.promise(promise, {
      loading: "Signing in...",
      success: "Welcome back!",
      error: (err) => err.message || "Login failed",
    });

    promise.finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FadeIn delay={100}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-paper-300 mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
            placeholder="you@example.com"
          />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-paper-300 mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
            placeholder="min. 8 characters"
          />
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-flash-500 text-ink-950 font-medium py-2.5 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </FadeIn>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        <FadeIn>
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-2xl text-paper-100 hover:text-flash-500 transition-colors">Knight</Link>
            <p className="text-sm text-paper-400 mt-2">Sign in to your dashboard</p>
          </div>
        </FadeIn>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-flash-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <FadeIn delay={400}>
          <p className="text-center text-sm text-paper-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-flash-500 hover:text-flash-400 transition-colors">
              Sign up
            </Link>
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={500}>
        <footer className="border-t border-line py-6 w-full">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <span className="font-display text-sm text-paper-400">Knight</span>
                <Link href="/about" className="text-xs text-paper-400 hover:text-paper-200 transition-colors">About</Link>
                <Link href="/contact" className="text-xs text-paper-400 hover:text-paper-200 transition-colors">Contact</Link>
                <Link href="/privacy" className="text-xs text-paper-400 hover:text-paper-200 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs text-paper-400 hover:text-paper-200 transition-colors">Terms</Link>
                <Link href="/refund" className="text-xs text-paper-400 hover:text-paper-200 transition-colors">Refund</Link>
              </div>
              <span className="text-xs text-paper-400">© {new Date().getFullYear()} Knight. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </FadeIn>
    </div>
  );
}
