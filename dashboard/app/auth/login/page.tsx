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
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(searchParams.get("redirect") || "/dashboard");
      return data;
    });

    toast.promise(promise, { loading: "Signing in...", success: "Welcome back!", error: err => err.message || "Login failed" });
    promise.finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FadeIn delay={100}>
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 8 characters"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-paper-100 text-neutral-950 font-medium py-2.5 text-sm hover:bg-paper-200 transition-all disabled:opacity-50 active:scale-[0.98]">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : "Sign in"}
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
            <Link href="/" className="font-display text-2xl text-paper-100 hover:text-neutral-300 transition-colors">Knight</Link>
            <p className="text-sm text-neutral-500 mt-2">Sign in to your dashboard</p>
          </div>
        </FadeIn>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-neutral-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <FadeIn delay={400}>
          <p className="text-center text-sm text-neutral-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-paper-100 hover:underline transition-colors">Sign up</Link>
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={500}>
        <footer className="border-t border-neutral-800 py-6 w-full">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <span className="font-display text-sm text-neutral-500">Knight</span>
                <Link href="/about" className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">About</Link>
                <Link href="/contact" className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">Contact</Link>
                <Link href="/privacy" className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">Terms</Link>
                <Link href="/refund" className="text-xs text-neutral-500 hover:text-paper-100 transition-colors">Refund</Link>
              </div>
              <span className="text-xs text-neutral-500">&copy; {new Date().getFullYear()} Knight. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </FadeIn>
    </div>
  );
}
