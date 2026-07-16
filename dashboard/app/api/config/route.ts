import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SAFE_SELECT = `id, org_id, company_name, company_website, services_offered, tone,
  calendly_link, sniper_keywords, sender_email, sender_domain, auto_send_threshold,
  daily_email_limit, telegram_enabled, telegram_phone, telegram_bot_token, telegram_admin_chat_id,
  created_at, updated_at`;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();

    // Get safe config fields
    const { data } = await supabase
      .from("org_config")
      .select(SAFE_SELECT)
      .eq("org_id", org.id)
      .single();

    // Check if telegram_session exists (without exposing it)
    const { data: sessionCheck } = await supabase
      .from("org_config")
      .select("telegram_session")
      .eq("org_id", org.id)
      .single();

    const result = {
      ...(data || {}),
      telegram_connected: !!sessionCheck?.telegram_session,
      telegram_mode: sessionCheck?.telegram_session ? "userbot" : null,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const body = await req.json();

    // Only update fields that are present in the body (don't overwrite secrets with null)
    const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.company_name !== undefined) updateFields.company_name = body.company_name;
    if (body.company_website !== undefined) updateFields.company_website = body.company_website;
    if (body.services_offered !== undefined) updateFields.services_offered = body.services_offered;
    if (body.calendly_link !== undefined) updateFields.calendly_link = body.calendly_link;
    if (body.tone !== undefined) updateFields.tone = body.tone;
    if (body.sniper_keywords !== undefined) updateFields.sniper_keywords = body.sniper_keywords;
    if (body.sender_email !== undefined) updateFields.sender_email = body.sender_email;
    if (body.sender_domain !== undefined) updateFields.sender_domain = body.sender_domain;
    if (body.auto_send_threshold !== undefined) updateFields.auto_send_threshold = body.auto_send_threshold;
    if (body.daily_email_limit !== undefined) updateFields.daily_email_limit = body.daily_email_limit;
    if (body.telegram_bot_token !== undefined) updateFields.telegram_bot_token = body.telegram_bot_token;
    if (body.telegram_admin_chat_id !== undefined) updateFields.telegram_admin_chat_id = body.telegram_admin_chat_id;
    if (body.telegram_phone !== undefined) updateFields.telegram_phone = body.telegram_phone;

    const { data: existing } = await supabase
      .from("org_config")
      .select("id")
      .eq("org_id", org.id)
      .single();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from("org_config")
        .update(updateFields)
        .eq("org_id", org.id)
        .select()
        .single();
      if (error) throw error;
      data = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from("org_config")
        .insert({ org_id: org.id, ...updateFields })
        .select()
        .single();
      if (error) throw error;
      data = inserted;
    }

    return NextResponse.json({ ok: true, config: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
