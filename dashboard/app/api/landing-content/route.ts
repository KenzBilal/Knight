import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// ─── Default content (fallback if DB is empty) ───────────────────────────────
const DEFAULTS: Record<string, unknown> = {
  hero: {
    headline: "Your AI sales rep",
    subheadline: "works 24/7.",
    tagline: "AI-powered B2B sales automation",
    description:
      "Knight finds businesses that need your service, audits their website, writes a personalized pitch, and sends it — automatically.",
    cta_primary: "Start free — no card required",
    cta_secondary: "See how it works",
    social_proof: "Free tier includes 50 leads and 50 emails per month",
  },
  stats: [
    { value: "30+", label: "Audit checks per site" },
    { value: "24/7", label: "Runs without you" },
    { value: "2 min", label: "Setup time" },
  ],
  steps: [
    {
      number: "01",
      title: "Tell Knight who to target",
      description:
        "Enter a business type and location. Knight searches Google Maps and finds real businesses matching your niche.",
    },
    {
      number: "02",
      title: "It audits every site",
      description:
        "Each lead gets a full 30-point website audit — SEO, performance, security, tech stack. Scored 0–100. Lower = more broken = hotter lead.",
    },
    {
      number: "03",
      title: "It pitches for you",
      description:
        "Knight writes a personalized cold email referencing specific problems it found, sends it, follows up, and handles replies — automatically.",
    },
  ],
  features: [
    {
      icon: "🔍",
      title: "Deep Website Audit",
      description:
        "30+ checks across SEO, performance, security, and tech stack. Every lead gets scored before you spend a second on them.",
    },
    {
      icon: "✍️",
      title: "AI Pitch Generation",
      description:
        "Gemini writes cold emails that reference specific issues on the prospect's site. Not templates. Actual context.",
    },
    {
      icon: "📞",
      title: "Autonomous Outreach",
      description:
        "Cold email with day 3 follow-up and day 7 breakup sequence. Telegram agent that holds real conversations. Runs 24/7 without you.",
    },
    {
      icon: "💬",
      title: "Smart Inbox",
      description:
        "When a prospect replies, AI classifies the intent and drafts a contextual response. You review once and send.",
    },
    {
      icon: "📊",
      title: "CRM Pipeline",
      description:
        "Kanban board from discovery to closed. Drag cards between stages. Every deal tracked in one place.",
    },
    {
      icon: "🔒",
      title: "BYOK Security",
      description:
        "Your API keys, your data. Knight uses Cohere, Gemini, and OpenRouter — all with generous free tiers. Costs you near zero.",
    },
  ],
  faq: [
    {
      q: "Do I need my own API keys?",
      a: "Yes — and that's the point. Knight uses your Cohere, Gemini, and OpenRouter keys. All three have free tiers that cover hundreds of leads per day. You pay directly, nothing is marked up.",
    },
    {
      q: "How does the website audit work?",
      a: "Knight visits the target site with a headless browser, runs 30+ checks across SEO, performance, security, and tech stack, then scores it. Lower score means bigger problems — hotter lead.",
    },
    {
      q: "Does the Telegram agent work automatically?",
      a: "Yes. Once connected, it finds leads in Telegram groups, sends personalized pitches, handles replies using AI, and runs a 7-day drip sequence — completely on autopilot.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. No contracts, no cancellation fees. Cancel from your billing page and keep access until the end of your billing period.",
    },
    {
      q: "What happens when a prospect replies?",
      a: "Knight classifies the intent (interested vs. rejected). If interested, it drafts a contextual reply using Gemini. You review the draft and send with one click.",
    },
  ],
  cta: {
    heading: "Stop doing sales",
    subheading: "manually.",
    description:
      "Set it up in two minutes. Knight finds your first lead before you finish your coffee.",
    button: "Create your free account",
  },
};

// ─── GET — fetch all sections ─────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("landing_content")
      .select("section, content");

    if (error) throw error;

    // Merge DB rows over defaults
    const result = { ...DEFAULTS };
    for (const row of data || []) {
      result[row.section] = row.content;
    }

    return NextResponse.json(result);
  } catch {
    // Always return defaults so page never breaks
    return NextResponse.json(DEFAULTS, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  }
}
