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

const OVERRIDE_FIELDS: Record<string, string> = {
  "enable-discovery": "override_discovery",
  "enable-osint": "override_osint",
  "enable-ai-pitching": "override_ai_pitching",
  "enable-webhooks": "override_webhooks",
  "enable-auto-email": "override_auto_email",
  "enable-telegram-userbot": "override_telegram_userbot",
};

export async function GET(_req: NextRequest) {
  try {
    const cookie = _req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const results: Record<string, boolean> = {};

    // Get user overrides
    const { data: userOverride } = await supabase
      .from("user_overrides")
      .select("*")
      .eq("user_id", user.id)
      .single();

    for (const key of FEATURE_FLAGS) {
      // 1. Check user override first
      const overrideField = OVERRIDE_FIELDS[key];
      if (userOverride && userOverride[overrideField] !== null) {
        results[key] = userOverride[overrideField];
        continue;
      }

      // 2. Fall back to org-level flag
      const { data } = await supabase.rpc("check_feature_flag", {
        flag_key: key,
        org_uuid: org.id,
      });
      results[key] = data !== false; // fail-open: true if RPC fails
    }

    // Check if suspended
    const isSuspended = userOverride?.is_suspended || false;

    return NextResponse.json({ flags: results, isSuspended });
  } catch (err: any) {
    // Fail-open: all features enabled if check fails
    const fallback: Record<string, boolean> = {};
    for (const key of FEATURE_FLAGS) fallback[key] = true;
    return NextResponse.json({ flags: fallback, isSuspended: false });
  }
}
