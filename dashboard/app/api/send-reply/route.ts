import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import { Resend } from "resend";
import { checkLimits, incrementUsage } from "@/lib/limits";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    // Check email limits
    const limits = await checkLimits(org.id, "email");
    if (!limits.allowed) {
      return NextResponse.json(
        { error: limits.reason, usage: limits.usage, limit: limits.limit },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { company_id, text } = await req.json();

    if (!company_id || !text) {
      return NextResponse.json({ error: "Missing company_id or text" }, { status: 400 });
    }

    // Verify the company belongs to this org
    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", company_id)
      .eq("org_id", org.id)
      .single();
    if (!company) throw new Error("Company not found");

    // Get the contact email
    const { data: contacts } = await supabase
      .from("contacts")
      .select("email")
      .eq("company_id", company_id)
      .eq("org_id", org.id);

    const targetEmail = contacts?.find((c: any) => c.email)?.email;
    if (!targetEmail) {
      return NextResponse.json({ error: "No email found for this contact" }, { status: 400 });
    }

    // Get org config for sender identity
    const { data: orgConfig } = await supabase
      .from("org_config")
      .select("company_name, sender_email")
      .eq("org_id", org.id)
      .single();

    const senderName = orgConfig?.company_name || "Knight";
    const senderEmail = orgConfig?.sender_email || process.env.RESEND_SENDER_EMAIL || "hello@knight.ai";

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: sendError } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: targetEmail,
      subject: `Following up from ${senderName}`,
      text,
      html: `<div style="font-family: 'Inter', sans-serif; color: #111; line-height: 1.6; white-space: pre-wrap;">${text}</div>`,
    });

    if (sendError) throw sendError;

    await supabase.from("emails").insert({
      company_id,
      org_id: org.id,
      direction: "outbound",
      subject: `Following up from ${senderName}`,
      body_text: text,
    });

    // Increment email usage
    await incrementUsage(org.id, "email");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to send reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
