"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
    <div className="flex-1 flex flex-col bg-white">
      {/* Form area — centered */}
      <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-14">
          <div className="w-full max-w-[360px]">
              <div className="mb-8">
                <h1 className="text-[32px] font-display font-semibold text-[#111] tracking-tight leading-tight mb-2">
                  Start for free
                </h1>
                <p className="text-[14px] text-[#888] leading-relaxed">
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
                    className="w-full rounded-lg border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-150 focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] hover:border-[#ccc]"
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
                    className="w-full rounded-lg border border-[#e4e4e4] bg-[#fafafa] px-4 py-3.5 text-[15px] text-[#111] placeholder:text-[#bbb] transition-all duration-150 focus:outline-none focus:border-[#111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] hover:border-[#ccc]"
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
        <div className="px-8 py-6 flex items-center gap-5">
          <Link href="/privacy" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Privacy</Link>
          <Link href="/terms" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Terms</Link>
          <Link href="/contact" className="text-[11px] text-[#bbb] hover:text-[#888] transition-colors">Contact</Link>
        </div>
    </div>
  );
}
