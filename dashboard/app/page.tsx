
import { LandingPage } from "@/components/LandingPage";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, unknown> = {
  hero: {
    headline: "Close more deals.",
    subheadline: "Work less.",
    tagline: "AI-powered B2B outbound — from prospect to booked meeting",
    description:
      "Knight finds qualified leads, audits their websites, writes hyper-personalized pitches, and handles the entire email sequence — all on autopilot. You show up for the meeting.",
    cta_primary: "Generate your first leads free",
    cta_secondary: "See how it works",
    social_proof: "No credit card required · Free plan includes 50 leads and 50 emails/month",
  },
  stats: [
    { value: "2 min", label: "From signup to first live campaign" },
    { value: "30+", label: "Lead quality signals checked per prospect" },
    { value: "24/7", label: "Pipeline generated while you sleep" },
  ],
  steps: [
    {
      number: "01",
      title: "Define your ideal customer",
      description:
        "Tell Knight your target business type and location. It searches Google Maps, qualifies real businesses, and builds a scored prospect list — in seconds, not hours.",
    },
    {
      number: "02",
      title: "Knight qualifies every lead",
      description:
        "Each prospect gets a 30-point website audit across SEO, performance, and security. Leads with broken sites are your hottest opportunities — Knight finds them automatically.",
    },
    {
      number: "03",
      title: "Personalized outreach, sent for you",
      description:
        "Knight writes a cold email referencing exact problems it found on that prospect's site, sends it, follows up, handles replies, and books meetings — without you lifting a finger.",
    },
  ],
  features: [
    {
      icon: "🎯",
      title: "Qualified Leads, Automatically",
      description:
        "Stop wasting time on prospects who aren't ready to buy. Knight scores every lead against 30+ signals so your outreach only goes to high-intent targets.",
    },
    {
      icon: "✍️",
      title: "Pitches That Actually Convert",
      description:
        "Forget generic templates. Every email Knight sends references specific, real issues found on that prospect's site — the kind of personalization that gets replies.",
    },
    {
      icon: "📬",
      title: "Full Outbound on Autopilot",
      description:
        "Initial email, day-3 follow-up, day-7 breakup. Knight runs your entire outbound sequence and handles incoming replies — generating pipeline around the clock.",
    },
    {
      icon: "💬",
      title: "Replies Handled Intelligently",
      description:
        "When a prospect responds, Knight reads the intent, drafts the perfect reply, and presents it to you for one-click send. Never miss a hot lead again.",
    },
    {
      icon: "📈",
      title: "Pipeline You Can See and Trust",
      description:
        "Every prospect tracked from discovery to closed deal. A clean Kanban board gives you complete visibility without the complexity of bloated CRMs.",
    },
    {
      icon: "🔒",
      title: "Your Data Stays Yours",
      description:
        "Knight runs on your own AI API keys (Gemini, Cohere, OpenRouter — all free tiers). Zero markup, zero data sharing. Your leads, your conversations, your business.",
    },
  ],
  faq: [
    {
      q: "How quickly can I generate my first leads?",
      a: "Most users have their first campaign running within 2 minutes of signing up. Set your target business type and location, connect your email, and Knight starts finding and qualifying leads immediately.",
    },
    {
      q: "Do I need to know how to code or use AI?",
      a: "No. Knight is a point-and-click product. You set your target, Knight handles the research, writing, and sending. If you can fill out a form, you can run Knight.",
    },
    {
      q: "What makes the outreach personalized — not just a mail-merge?",
      a: "Knight audits each prospect's website in real-time, finds actual problems (slow load times, missing SEO tags, security gaps), and references those specific issues in the email. The prospect sees you've done your homework — because the AI genuinely has.",
    },
    {
      q: "Do I need my own API keys?",
      a: "Yes — and it's a feature, not a limitation. Your AI keys (Gemini, Cohere, OpenRouter) mean AI costs go directly to providers at cost, with no markup. All three offer free tiers that cover hundreds of leads per day. You keep full control and pay near-zero.",
    },
    {
      q: "What happens when a prospect replies?",
      a: "Knight detects the reply, classifies the intent (interested, rejected, or needs follow-up), and drafts a contextual response using your conversation history. You review the draft and send with one click — or let it handle the full thread.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, always. No contracts, no cancellation fees, no awkward calls. Cancel from your account page and keep full access until your current billing period ends.",
    },
  ],
  cta: {
    heading: "Your pipeline shouldn't",
    subheading: "depend on you.",
    description:
      "Set Knight up in two minutes. It finds prospects, qualifies them, writes the pitch, sends it, and follows up — all before your next coffee. You only show up to close.",
    button: "Start for free — no card required",
  },
};


async function getLandingContent() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("landing_content")
      .select("section, content");

    if (error) throw error;

    const result = { ...DEFAULTS };
    for (const row of data || []) {
      result[row.section] = row.content;
    }
    return result;
  } catch {
    return null;
  }
}

export default async function Page() {
  const content = await getLandingContent();
  return <LandingPage content={content} />;
}
