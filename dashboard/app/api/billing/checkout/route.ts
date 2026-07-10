import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createCheckoutSession, PLAN_VARIANTS } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const { plan } = await req.json();

    // Map plan name to variant ID
    const variantId = PLAN_VARIANTS[plan as keyof typeof PLAN_VARIANTS];
    if (!variantId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      variantId,
      user.id,
      user.email!,
      org.id
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
