import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { action } = await req.json(); // "start" or "stop"

    const isRunning = action === "start";

    await supabase
      .from("engine_control")
      .upsert({
        org_id: org.id,
        is_running: isRunning,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ ok: true, is_running: isRunning });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
