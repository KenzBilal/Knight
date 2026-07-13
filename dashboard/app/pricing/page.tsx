import { createServiceClient } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Start free, upgrade when you're ready. Knight pays for itself with one closed client.",
};

// Revalidate every 60s — admin app also triggers on-demand revalidation on plan save
export const revalidate = 60;

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string | null;
  features: string[];
  highlighted: boolean;
  active: boolean;
  sort_order: number;
  lemon_variant_id: string | null;
}

function formatPrice(cents: number, period: string) {
  if (cents === 0) return { amount: "$0", period: "forever" };
  const dollars = cents / 100;
  const whole = Number.isInteger(dollars) ? dollars.toString() : dollars.toFixed(0);
  return {
    amount: `$${whole}`,
    period: period === "month" ? "/month" : period === "year" ? "/year" : "",
  };
}

async function getPlans(): Promise<Plan[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("plans")
      .select("id,name,price,period,description,features,highlighted,active,sort_order,lemon_variant_id")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data as Plan[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }: { plan: Plan }) {
  const { amount, period } = formatPrice(plan.price, plan.period);
  const signupHref = plan.lemon_variant_id
    ? `/auth/signup?plan=${plan.id}`
    : `/auth/signup`;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
        plan.highlighted
          ? "bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_24px_48px_rgba(0,0,0,0.4)]"
          : "bg-[#0f0f0f] border border-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      {/* Popular badge */}
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#080808] border border-white/[0.1] rounded-full px-3.5 py-1 text-[10px] font-mono text-[#a3a3a3] uppercase tracking-widest whitespace-nowrap">
          Most popular
        </span>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2
          className={`text-lg font-bold mb-1 ${
            plan.highlighted ? "text-black" : "text-white"
          }`}
        >
          {plan.name}
        </h2>
        <p
          className={`text-xs mb-6 ${
            plan.highlighted ? "text-black/50" : "text-[#525252]"
          }`}
        >
          {plan.description}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-5xl font-bold tracking-tight ${
              plan.highlighted ? "text-black" : "text-white"
            }`}
          >
            {amount}
          </span>
          {period && (
            <span
              className={`text-sm ${
                plan.highlighted ? "text-black/40" : "text-[#3a3a3a]"
              }`}
            >
              {period}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-10 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`flex-shrink-0 mt-0.5 ${
                plan.highlighted ? "text-black/40" : "text-[#3a3a3a]"
              }`}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span
              className={plan.highlighted ? "text-black/75" : "text-[#737373]"}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={signupHref}
        className={`block text-center rounded-xl py-3 text-sm font-semibold transition-all ${
          plan.highlighted
            ? "bg-black text-white hover:bg-[#111]"
            : "border border-white/[0.08] text-[#a3a3a3] hover:text-white hover:bg-white/[0.04] hover:border-white/[0.16]"
        }`}
      >
        {plan.price === 0 ? "Get started free" : `Start ${plan.name}`}
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PricingPage() {
  const plans = await getPlans();

  const colClass =
    plans.length === 2
      ? "md:grid-cols-2 max-w-2xl"
      : plans.length === 3
      ? "md:grid-cols-3 max-w-4xl"
      : "md:grid-cols-2 xl:grid-cols-4 max-w-6xl";

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-4 animate-fade-up">
            Pricing
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight mb-5 animate-fade-up animate-delay-100">
            One client pays for
            <br />
            <span className="text-[#525252]">a year of Knight.</span>
          </h1>
          <p className="text-base text-[#737373] leading-relaxed animate-fade-up animate-delay-200">
            Start free. Upgrade when you're ready. Cancel anytime — no lock-in,
            no contracts.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-28 md:pb-36">
        <div className={`mx-auto px-6 ${colClass}`}>
          {plans.length === 0 ? (
            <div className="text-center text-[#525252] py-16">
              No plans available right now. Check back soon.
            </div>
          ) : (
            <div className={`grid gap-5 ${colClass.split(" ")[0]}`}>
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ-style guarantee strip */}
      <section className="border-t border-white/[0.04] bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: "↩", title: "Cancel anytime", desc: "No contracts. Stop whenever you like, keep access until period ends." },
              { icon: "🔑", title: "Your keys, your data", desc: "BYOK means AI costs go directly to providers. No markup." },
              { icon: "⚡", title: "Live in 2 minutes", desc: "Paste your keys, set your niche, Knight starts finding leads." },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-2xl mb-3">{item.icon}</p>
                <p className="text-sm font-semibold text-white mb-1.5">{item.title}</p>
                <p className="text-xs text-[#525252] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/[0.04] py-24 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Still unsure?
          </h2>
          <p className="text-[#525252] text-sm mb-8">
            The free plan has no time limit. Try every feature with 50 leads and
            50 emails per month — no card required.
          </p>
          <Link
            href="/auth/signup"
            className="btn-primary px-8 py-3.5 text-sm font-semibold"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
