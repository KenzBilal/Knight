import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Usage Policy — Knight",
  description: "How Knight uses artificial intelligence, your responsibilities as a user, and how AI-generated content is handled.",
};

export default function AIPolicyPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-4">AI Usage Policy</h1>
        <p className="text-sm text-[#3a3a3a] mb-16 font-mono">Last updated: July 2026</p>

        <div className="space-y-12 text-[#525252] leading-relaxed">
          <section>
            <p>Knight integrates artificial intelligence to help you find leads, analyze websites, and draft outreach. This policy explains how we use AI, its limitations, and your responsibilities when using AI-generated content in your sales activities.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-6">How Knight uses AI</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Lead qualification and scoring",
                  desc: "AI analyzes website quality signals (SEO, performance, security, design) to score leads on a 0–100 scale. Higher scores indicate stronger prospects. This scoring is probabilistic and should be treated as guidance, not a guarantee.",
                },
                {
                  title: "Personalized email drafting",
                  desc: "Knight uses large language models (Google Gemini, Cohere, OpenRouter) to draft cold emails and follow-up sequences referencing specific issues found on each prospect's website. These drafts are generated using your API keys and are stored under your account.",
                },
                {
                  title: "Reply classification and intent detection",
                  desc: "When a prospect replies to your outreach, AI classifies the intent (interested, not interested, out-of-office, referral, etc.) and drafts a suggested response. You review and send manually.",
                },
                {
                  title: "Telegram conversation handling",
                  desc: "Knight's Telegram agent uses AI to engage in initial conversations with prospects, qualify interest, and hand off to you when a lead shows intent. All AI-generated messages are logged and reviewable.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-white/[0.06] bg-[#0f0f0f] rounded-xl p-6">
                  <h3 className="font-display text-sm text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#525252]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">AI limitations you should know</h2>
            <p className="mb-4">AI systems can and do make mistakes. Knight&apos;s AI features are powerful tools, not infallible authorities. Important limitations include:</p>
            <ul className="space-y-3">
              {[
                "AI-generated emails may contain factual inaccuracies about a prospect's website or business. Always review before sending.",
                "Lead scores are based on detectable signals, not actual business intent. A low-scoring site does not mean the owner is ready to buy.",
                "Reply classification may misinterpret tone, irony, or non-native English. Review AI-suggested responses carefully.",
                "AI models have knowledge cutoffs and may not reflect recent changes to a prospect's business or website.",
                "Knight does not guarantee that AI-generated content will be effective, legally compliant, or free from error.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#525252]">
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#525252" strokeWidth="1"/>
                    <path d="M8 5v4M8 11h.01" stroke="#525252" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Your responsibility for AI-generated content</h2>
            <p className="mb-4">You are fully responsible for any content generated by Knight&apos;s AI features that you send, publish, or act upon. Specifically:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>You must review AI-drafted emails before sending them</li>
              <li>You must ensure all outreach complies with applicable laws (CAN-SPAM, GDPR, etc.)</li>
              <li>You must not use AI-generated content to deceive, mislead, or harm recipients</li>
              <li>You are liable for any claims arising from AI-generated content you send</li>
            </ul>
            <p className="mt-4">Knight is a tool that amplifies your capabilities. You remain the decision-maker and bear responsibility for how that amplification is used.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Data used for AI</h2>
            <p className="mb-4">AI inference in Knight uses:</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>Publicly available information scraped from prospect websites</li>
              <li>Your company profile and services as entered in Knight settings</li>
              <li>Your own API keys — calls go directly to AI providers, not through Knight servers</li>
            </ul>
            <p className="mt-4">Knight does not use your data, your prospects&apos; data, or AI-generated content to train AI models. Your API keys are subject to each AI provider&apos;s terms of service.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Opting out of AI features</h2>
            <p>You can use Knight without AI features. Lead discovery and website auditing do not require AI. You can choose to write your own email templates instead of using AI generation. Contact <a href="mailto:support@knight.app" className="text-white hover:underline">support@knight.app</a> if you need help configuring Knight to minimize AI-generated content.</p>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">AI provider terms</h2>
            <p>Knight integrates with third-party AI providers. When you use Knight&apos;s AI features with your own API keys, your usage is also governed by those providers&apos; terms:</p>
            <ul className="space-y-2 list-disc list-inside ml-4 mt-4">
              <li>Google Gemini — <a href="https://ai.google.dev/terms" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">ai.google.dev/terms</a></li>
              <li>Cohere — <a href="https://cohere.com/terms-of-use" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">cohere.com/terms-of-use</a></li>
              <li>OpenRouter — <a href="https://openrouter.ai/terms" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">openrouter.ai/terms</a></li>
            </ul>
          </section>

          <section className="border-t border-white/[0.05] pt-12">
            <h2 className="font-display text-2xl text-white mb-4">Contact</h2>
            <p>Questions about our AI usage? Email <a href="mailto:legal@knight.app" className="text-white hover:underline">legal@knight.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
