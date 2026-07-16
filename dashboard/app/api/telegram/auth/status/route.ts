import { NextResponse } from "next/server";
import { requireTelegramAuth } from "@/lib/telegram-auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { org } = await requireTelegramAuth(req);

    const supabase = createServiceClient();
    const { data } = await supabase
      .from("org_config")
      .select("telegram_session")
      .eq("org_id", org.id)
      .single();

    return NextResponse.json({
      connected: !!data?.telegram_session,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
