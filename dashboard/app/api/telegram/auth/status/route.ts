import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

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
      .select("telegram_session, telegram_username, telegram_mode, telegram_phone")
      .eq("org_id", org.id)
      .single();

    return NextResponse.json({
      connected: !!data?.telegram_session,
      username: data?.telegram_username || null,
      mode: data?.telegram_mode || null,
      phone: data?.telegram_phone || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
