import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import { Resend } from "resend";
import { checkLimits, incrementUsage } from "@/lib/limits";
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { renderTemplate, renderSubject, TemplateVariables } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    // Rate limit check
    const rateLimit = checkRateLimit(`sendReply:${org.id}`, RATE_LIMITS.sendReply);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Check email limits
    const limits = await checkLimits(org.id, "email");
    if (!limits.allowed) {
      return NextResponse.json(
        { error: limits.reason, usage: limits.usage, limit: limits.limit },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { company_id, text, template_id, template_variables } = await req.json();

    if (!company_id) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
    }

    // Verify the company belongs to this org
    const { data: company } = await supabase
      .from("companies")
      .select("id, name, industry")
      .eq("id", company_id)
      .eq("org_id", org.id)
      .single();
    if (!company) throw new Error("Company not found");

    // Get the contact email
    const { data: contacts } = await supabase
      .from("contacts")
      .select("email, first_name, last_name")
      .eq("company_id", company_id)
      .eq("org_id", org.id);

    const targetContact = contacts?.find((c: any) => c.email);
    if (!targetContact?.email) {
      return NextResponse.json({ error: "No email found for this contact" }, { status: 400 });
    }

    // Get org config for sender identity
    const { data: orgConfig } = await supabase
      .from("org_config")
      .select("company_name, sender_email, company_website, calendly_link")
      .eq("org_id", org.id)
      .single();

    const senderName = orgConfig?.company_name || "Knight";
    const senderEmail = orgConfig?.sender_email || process.env.RESEND_SENDER_EMAIL || "hello@knight.ai";

    let emailSubject: string;
    let emailBody: string;

    // Use template if provided, otherwise use raw text
    if (template_id) {
      const { data: template } = await supabase
        .from("email_templates")
        .select("subject, body")
        .eq("id", template_id)
        .eq("org_id", org.id)
        .single();

      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      // Build template variables
      const variables: TemplateVariables = {
        company_name: company.name,
        contact_name: targetContact.first_name 
          ? `${targetContact.first_name} ${targetContact.last_name || ""}`.trim()
          : "there",
        sender_name: senderName,
        sender_website: orgConfig?.company_website || "",
        calendly_link: orgConfig?.calendly_link || "",
        industry: company.industry || "",
        ...template_variables,
      };

      emailSubject = renderSubject(template.subject, variables);
      emailBody = renderTemplate(template.body, variables);
    } else if (text) {
      // Use raw text (backward compatibility)
      emailSubject = `Following up from ${senderName}`;
      emailBody = text;
    } else {
      return NextResponse.json({ error: "Missing template_id or text" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: sendError } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: targetContact.email,
      subject: emailSubject,
      text: emailBody,
      html: `<div style="font-family: 'Inter', sans-serif; color: #111; line-height: 1.6; white-space: pre-wrap;">${emailBody}</div>`,
    });

    if (sendError) throw sendError;

    await supabase.from("emails").insert({
      company_id,
      org_id: org.id,
      direction: "outbound",
      subject: emailSubject,
      body_text: emailBody,
    });

    // Increment email usage
    await incrementUsage(org.id, "email");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to send reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
