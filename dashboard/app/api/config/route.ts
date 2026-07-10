import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { data } = await supabase
      .from("org_config")
      .select("*")
      .eq("org_id", org.id)
      .single();

    return NextResponse.json(data || {});
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

    const { data, error } = await supabase
      .from("org_config")
      .upsert({
        org_id: org.id,
        company_name: body.company_name,
        company_website: body.company_website,
        services_offered: body.services_offered,
        calendly_link: body.calendly_link,
        telegram_bot_token: body.telegram_bot_token || null,
        telegram_admin_chat_id: body.telegram_admin_chat_id || null,
        telegram_mode: body.telegram_mode || null,
        telegram_phone: body.telegram_phone || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, config: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
