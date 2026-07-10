import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-paper-100">Knight</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm text-paper-100 font-medium">About</Link>
            <Link href="/contact" className="text-sm text-paper-300 hover:text-paper-100 transition-colors">Contact</Link>
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
        <h1 className="font-display text-4xl md:text-5xl text-paper-100 mb-8">About Knight</h1>
        
        <div className="space-y-8 text-paper-300 leading-relaxed">
          <p className="text-lg">
            Knight is an AI-powered B2B sales agent that helps agencies and freelancers find new clients automatically. 
            We combine website auditing, personalized outreach, and AI-driven conversations into one autonomous platform.
          </p>

          <div className="rounded-xl border border-line bg-ink-900 p-8">
            <h2 className="font-display text-2xl text-paper-100 mb-4">Our Mission</h2>
            <p>
              We believe sales should be smart, not spammy. Knight finds businesses that actually need your services, 
              audits their online presence, and crafts personalized pitches that reference real issues — not generic templates. 
              Our goal is to make professional B2B outreach accessible to every freelancer and agency, regardless of team size.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-ink-900 p-8">
            <h2 className="font-display text-2xl text-paper-100 mb-4">How It Works</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-flash-500 mt-1">1.</span>
                <span>Tell Knight who to find — enter your niche and location.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-flash-500 mt-1">2.</span>
                <span>Knight discovers businesses via Google Maps and runs a 30+ point website audit.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-flash-500 mt-1">3.</span>
                <span>AI generates personalized cold emails referencing specific issues on their site.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-flash-500 mt-1">4.</span>
                <span>Outreach runs automatically via email and Telegram, with drip sequences and follow-ups.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-ink-900 p-8">
            <h2 className="font-display text-2xl text-paper-100 mb-4">Technology</h2>
            <p>
              Knight is built with Next.js, Supabase, and integrates with leading AI providers including Cohere, Google Gemini, 
              and OpenRouter. We use Puppeteer for website analysis, Resend for email delivery, and Telegram MTProto for 
              direct messaging capabilities.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-ink-900 p-8">
            <h2 className="font-display text-2xl text-paper-100 mb-4">Contact</h2>
            <p>
              Have questions? Reach out at{" "}
              <a href="mailto:support@knight.com" className="text-flash-500 hover:underline">support@knight.com</a>
              {" "}or visit our{" "}
              <Link href="/contact" className="text-flash-500 hover:underline">contact page</Link>.
            </p>
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
