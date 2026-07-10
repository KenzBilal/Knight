"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // In production, this would send to your email via Resend or similar
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-paper-100">Knight</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-paper-100 font-medium">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-4">Contact Us</h1>
        <p className="text-lg text-paper-300 mb-12">
          Have a question, need help, or want to partner? We&apos;d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="rounded-xl border border-line bg-ink-900 p-8">
            <h2 className="font-display text-xl text-paper-100 mb-6">Send a Message</h2>
            
            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="font-display text-lg text-paper-100 mb-2">Message Sent</h3>
                <p className="text-sm text-paper-400">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="rounded-xl border border-line bg-ink-900 p-8">
              <h2 className="font-display text-xl text-paper-100 mb-4">Email</h2>
              <p className="text-paper-300">
                For general inquiries, support, or business opportunities:
              </p>
              <a href="mailto:support@knight.com" className="text-flash-500 hover:underline mt-2 inline-block">
                support@knight.com
              </a>
            </div>

            <div className="rounded-xl border border-line bg-ink-900 p-8">
              <h2 className="font-display text-xl text-paper-100 mb-4">Response Time</h2>
              <p className="text-paper-300">
                We typically respond within 24 hours during business days. For urgent issues, 
                please include &quot;URGENT&quot; in your subject line.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-ink-900 p-8">
              <h2 className="font-display text-xl text-paper-100 mb-4">Office Hours</h2>
              <p className="text-paper-300">
                Monday — Friday: 9:00 AM — 6:00 PM (EST)<br />
                Saturday — Sunday: Closed
              </p>
            </div>

            <div className="rounded-xl border border-line bg-ink-900 p-8">
              <h2 className="font-display text-xl text-paper-100 mb-4">Social</h2>
              <div className="flex gap-4">
                <a href="https://twitter.com/knight" target="_blank" rel="noopener noreferrer" className="text-paper-400 hover:text-paper-100 transition-colors">
                  Twitter
                </a>
                <a href="https://github.com/KenzBilal/Knight" target="_blank" rel="noopener noreferrer" className="text-paper-400 hover:text-paper-100 transition-colors">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="font-display text-sm text-paper-400">Knight</span>
              <Link href="/about" className="text-xs text-paper-400 hover:text-paper-200">About</Link>
              <Link href="/contact" className="text-xs text-paper-400 hover:text-paper-200">Contact</Link>
              <Link href="/privacy" className="text-xs text-paper-400 hover:text-paper-200">Privacy</Link>
              <Link href="/terms" className="text-xs text-paper-400 hover:text-paper-200">Terms</Link>
              <Link href="/refund" className="text-xs text-paper-400 hover:text-paper-200">Refund</Link>
            </div>
            <span className="text-xs text-paper-400">© {new Date().getFullYear()} Knight. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
