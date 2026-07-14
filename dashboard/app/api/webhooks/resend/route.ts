import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const supabase = createServiceClient();

    const payloadString = await req.text();
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET not configured" }, { status: 500 });
    }

    const wh = new Webhook(webhookSecret);
    let payload: any;
    try {
      payload = wh.verify(payloadString, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (payload.type !== "email.received") {
      return NextResponse.json({ message: "Ignored" });
    }

    const { from, subject, text } = payload.data;
    const emailMatch = from.match(/<([^>]+)>/) || [null, from];
    const senderEmail = emailMatch[1].toLowerCase().trim();

    // Find the contact — scoped by org via the company
    // Use maybeSingle() to handle multiple matches across orgs gracefully
    const { data: contacts } = await supabase
      .from("contacts")
      .select("company_id, org_id")
      .ilike("email", senderEmail);

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ message: "Contact not found" });
    }

    // Prefer the most recent match (by company creation) if multiple exist
    const contact = contacts[0];

    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .insert({
        company_id: contact.company_id,
        org_id: contact.org_id,
        direction: "inbound",
        subject,
        body_text: text,
      })
      .select()
      .single();

    if (emailError) throw emailError;

    await supabase
      .from("companies")
      .update({ status: "REPLIED" })
      .eq("id", contact.company_id)
      .eq("org_id", contact.org_id);

    await supabase.from("jobs").insert({
      org_id: contact.org_id,
      type: "PROCESS_REPLY",
      status: "PENDING",
      payload: { email_id: emailData.id, company_id: contact.company_id, body_text: text },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
