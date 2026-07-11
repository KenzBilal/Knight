import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-[#111] mb-8">About Knight</h1>

        <div className="space-y-8 text-[#666] leading-relaxed">
          <p className="text-lg">
            Knight is an AI-powered B2B sales agent that helps agencies and freelancers find new clients automatically.
          </p>

          <div className="rounded-xl border border-[#ebebeb] bg-white p-8 ">
            <h2 className="font-display text-2xl text-[#111] mb-4">Our Mission</h2>
            <p>
              Sales should be smart, not spammy. Knight finds businesses that actually need your services,
              audits their online presence, and crafts personalized pitches that reference real issues — not generic templates.
              Our goal is to make professional B2B outreach accessible to every freelancer and agency.
            </p>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-white p-8 ">
            <h2 className="font-display text-2xl text-[#111] mb-4">How It Works</h2>
            <ul className="space-y-3">
              {[
                "Tell Knight who to find — enter your niche and location.",
                "Knight discovers businesses via Google Maps and runs a 30+ point website audit.",
                "AI generates personalized cold emails referencing specific issues on their site.",
                "Outreach runs automatically via email and Telegram, with drip sequences and follow-ups.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#111] font-mono text-sm mt-0.5">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-white p-8 ">
            <h2 className="font-display text-2xl text-[#111] mb-4">Technology</h2>
            <p>
              Built with Next.js, Supabase, and leading AI providers (Cohere, Google Gemini, OpenRouter).
              Puppeteer for website analysis, Resend for email delivery, Telegram MTProto for direct messaging.
            </p>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-white p-8 ">
            <h2 className="font-display text-2xl text-[#111] mb-4">Contact</h2>
            <p>
              Questions? Reach out at{" "}
              <a href="mailto:support@knight.com" className="text-[#111] hover:underline">support@knight.com</a>
              {" "}or visit our{" "}
              <Link href="/contact" className="text-[#111] hover:underline">contact page</Link>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
