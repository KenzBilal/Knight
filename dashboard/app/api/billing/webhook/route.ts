import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { getPlanFromVariant } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

// Verify webhook signature
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  
  // Use timing-safe comparison
  const sigBuffer = Buffer.from(signature, "hex");
  const hmacBuffer = Buffer.from(hmac, "hex");
  
  if (sigBuffer.length !== hmacBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, hmacBuffer);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");

    // Verify webhook signature
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const data = event.data;
    const customData = data.attributes.custom_data;

    console.log(`[LemonSqueezy Webhook] Received: ${eventName}`);

    const supabase = createServiceClient();

    // Extract user_id and org_id from custom data
    const userId = customData?.user_id;
    const orgId = customData?.org_id;

    if (!userId || !orgId) {
      console.error("Missing user_id or org_id in webhook data");
      return NextResponse.json({ received: true });
    }

    const subscriptionId = data.id;
    const variantId = data.attributes.variant_id?.toString();
    const _status = data.attributes.status;
    const _renewsAt = data.attributes.renews_at;
    const endsAt = data.attributes.ends_at;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const plan = variantId ? await getPlanFromVariant(variantId) : "free";
        
        // Update org with subscription details
        await supabase
          .from("orgs")
          .update({
            plan: plan,
            lemon_subscription_id: subscriptionId,
            lemon_customer_id: data.attributes.customer_id?.toString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orgId);

        console.log(`[LemonSqueezy Webhook] Org ${orgId} updated to plan: ${plan}`);
        break;
      }

      case "subscription_cancelled": {
        // Keep the plan active until ends_at
        // Only downgrade when subscription expires
        if (endsAt) {
          await supabase
            .from("orgs")
            .update({
              lemon_subscription_ends_at: endsAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orgId);
        }
        console.log(`[LemonSqueezy Webhook] Subscription cancelled for org ${orgId}, ends at: ${endsAt}`);
        break;
      }

      case "subscription_expired": {
        // Downgrade to free plan
        await supabase
          .from("orgs")
          .update({
            plan: "free",
            lemon_subscription_id: null,
            lemon_subscription_ends_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orgId);

        console.log(`[LemonSqueezy Webhook] Org ${orgId} downgraded to free (subscription expired)`);
        break;
      }

      case "subscription_payment_success": {
        console.log(`[LemonSqueezy Webhook] Payment received for org ${orgId}`);
        break;
      }

      case "subscription_payment_failed": {
        console.log(`[LemonSqueezy Webhook] Payment failed for org ${orgId}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[LemonSqueezy Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
