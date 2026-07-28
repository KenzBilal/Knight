import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FEATURE_FLAGS = [
  "enable-discovery",
  "enable-osint",
  "enable-ai-pitching",
  "enable-webhooks",
  "enable-auto-email",
  "enable-telegram-userbot",
];

export async function GET(_req: NextRequest) {
  try {
    const cookie = _req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const results: Record<string, boolean> = {};

    for (const key of FEATURE_FLAGS) {
      const { data } = await supabase.rpc("check_feature_flag", {
        flag_key: key,
        org_uuid: org.id,
      });
      results[key] = data !== false; // fail-open: true if RPC fails
    }

    return NextResponse.json({ flags: results });
  } catch (err: any) {
    // Fail-open: all features enabled if check fails
    const fallback: Record<string, boolean> = {};
    for (const key of FEATURE_FLAGS) fallback[key] = true;
    return NextResponse.json({ flags: fallback });
  }
}
