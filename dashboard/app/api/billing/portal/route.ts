import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { getSubscriptionDetails } from "@/lib/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    // Get subscription ID from org
    const supabase = createServiceClient();
    const { data: orgData } = await supabase
      .from("orgs")
      .select("lemon_subscription_id")
      .eq("id", org.id)
      .single();

    if (!orgData?.lemon_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Get subscription details from LemonSqueezy
    const subscription = await getSubscriptionDetails(orgData.lemon_subscription_id);
    
    if (!subscription?.attributes?.urls?.customer_portal) {
      return NextResponse.json({ error: "Portal URL not available" }, { status: 400 });
    }

    return NextResponse.json({ 
      portalUrl: subscription.attributes.urls.customer_portal 
    });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
