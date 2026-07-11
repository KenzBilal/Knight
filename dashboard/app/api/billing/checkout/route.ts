import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const { variant_id } = await req.json();

    if (!variant_id) {
      return NextResponse.json({ error: "Missing variant_id" }, { status: 400 });
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      variant_id,
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
