import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { customer_email, customer_details, metadata } = session;
      const email = customer_email || customer_details?.email;
      const plan = (metadata?.plan || "starter") as string;

      if (!email) return NextResponse.json({ received: true });

      // Find the user by email
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find((u) => u.email === email);

      if (!authUser) {
        console.warn("[stripe:webhook] No auth user found for email:", email);
        return NextResponse.json({ received: true });
      }

      // Find the org
      const { data: member } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", authUser.id)
        .single();

      if (!member) {
        console.warn("[stripe:webhook] No org found for user:", authUser.id);
        return NextResponse.json({ received: true });
      }

      // Update org plan and Stripe IDs
      await supabase
        .from("orgs")
        .update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", member.org_id);

      // Send welcome email
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Knight <hello@knight.dev>",
          to: email,
          subject: `Welcome to Knight ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
          html: `
            <h1>Welcome to Knight!</h1>
            <p>Your <strong>${plan}</strong> plan is now active.</p>
            <p>Log in to your dashboard to start finding leads:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#08080a;text-decoration:none;border-radius:8px;font-weight:600;">Go to Dashboard</a>
          `,
        });
      } catch (emailErr) {
        console.error("[stripe:webhook] Failed to send welcome email:", emailErr);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("orgs")
        .update({ plan: "free", stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe:webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
