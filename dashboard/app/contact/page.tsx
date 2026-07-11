"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-4">Contact Us</h1>
        <p className="text-lg text-neutral-400 mb-12">
          Have a question, need help, or want to partner? We&apos;d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 grain-card">
            <h2 className="font-display text-xl text-paper-100 mb-6">Send a Message</h2>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-paper-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-lg text-paper-100 mb-2">Message Sent</h3>
                <p className="text-sm text-neutral-500">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Subject</label>
                  <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="How can we help?"
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Message</label>
                  <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us more..."
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-all disabled:opacity-50 active:scale-[0.98]">
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 grain-card">
              <h2 className="font-display text-xl text-paper-100 mb-3">Email</h2>
              <p className="text-sm text-neutral-400">For general inquiries, support, or business opportunities:</p>
              <a href="mailto:support@knight.com" className="text-sm text-paper-100 hover:underline mt-2 inline-block">support@knight.com</a>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 grain-card">
              <h2 className="font-display text-xl text-paper-100 mb-3">Response Time</h2>
              <p className="text-sm text-neutral-400">
                We respond within 24 hours on business days. For urgent issues, include &quot;URGENT&quot; in your subject line.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 grain-card">
              <h2 className="font-display text-xl text-paper-100 mb-3">Hours</h2>
              <p className="text-sm text-neutral-400">
                Monday — Friday: 9 AM — 6 PM (EST)<br />
                Saturday — Sunday: Closed
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 grain-card">
              <h2 className="font-display text-xl text-paper-100 mb-3">Social</h2>
              <div className="flex gap-4">
                <a href="https://github.com/KenzBilal/Knight" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-paper-100 transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
