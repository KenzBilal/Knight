import { NextResponse } from "next/server";
import { createServiceClient } from "./supabase";

const USER_OVERRIDE_FIELDS: Record<string, string> = {
  "enable-discovery": "override_discovery",
  "enable-osint": "override_osint",
  "enable-ai-pitching": "override_ai_pitching",
  "enable-webhooks": "override_webhooks",
  "enable-auto-email": "override_auto_email",
  "enable-telegram-userbot": "override_telegram_userbot",
};

/**
 * Check if a feature kill switch is enabled for an org/user.
 * Priority: User override → Org flag → Global default (true)
 * Returns null if feature is enabled (allow), or NextResponse 403 if disabled (block).
 */
export async function checkKillSwitch(
  flagKey: string,
  orgId: string,
  userId?: string
): Promise<NextResponse | null> {
  const supabase = createServiceClient();

  // 1. Check user override first (highest priority)
  if (userId) {
    const overrideField = USER_OVERRIDE_FIELDS[flagKey];
    if (!overrideField) {
      return NextResponse.json({ error: "Unknown feature flag" }, { status: 400 });
    }
    const { data: userOverride, error: overrideError } = await supabase
      .from("user_overrides")
      .select(overrideField)
      .eq("user_id", userId)
      .eq("org_id", orgId)
      .maybeSingle();

    if (overrideError) {
      console.error(`[KillSwitch] Failed to check user override for ${flagKey}:`, overrideError);
      return NextResponse.json(
        { error: "FEATURE_CHECK_UNAVAILABLE", message: "Feature access could not be verified." },
        { status: 503 }
      );
    }

    if (userOverride && (userOverride as Record<string, any>)[overrideField] !== null) {
      if (!(userOverride as Record<string, any>)[overrideField]) {
        return NextResponse.json(
          {
            error: "FEATURE_DISABLED",
            message: `This feature has been disabled for your account by an admin.`,
          },
          { status: 403 }
        );
      }
      return null; // User override = enabled, allow
    }
  }

  // 2. Fall back to org-level flag
  const { data, error } = await supabase.rpc("check_feature_flag", {
    flag_key: flagKey,
    org_uuid: orgId,
  });

  if (error) {
    console.error(`[KillSwitch] Failed to check ${flagKey}:`, error);
    return NextResponse.json(
      { error: "FEATURE_CHECK_UNAVAILABLE", message: "Feature access could not be verified." },
      { status: 503 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: "FEATURE_DISABLED",
        message: `This feature has been disabled by your organization admin.`,
      },
      { status: 403 }
    );
  }

  return null; // feature is enabled, allow
}

/**
 * Check if a user is suspended.
 * Returns null if not suspended, or NextResponse 403 if suspended.
 */
export async function checkSuspended(userId: string): Promise<NextResponse | null> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("user_overrides")
    .select("is_suspended, suspension_reason")
    .eq("user_id", userId)
    .single();

  if (data?.is_suspended) {
    return NextResponse.json(
      {
        error: "ACCOUNT_SUSPENDED",
        message: data.suspension_reason || "Your account has been suspended by an admin.",
      },
      { status: 403 }
    );
  }

  return null; // not suspended
}

/**
 * Check kill switch and return a 403 error response if disabled.
 * Use at the top of API routes before any processing.
 */
export async function requireFeature(
  flagKey: string,
  orgId: string,
  userId?: string
): Promise<void> {
  const error = await checkKillSwitch(flagKey, orgId, userId);
  if (error) throw new KillSwitchError(error);
}

export class KillSwitchError extends Error {
  response: NextResponse;
  constructor(response: NextResponse) {
    super("Feature disabled");
    this.response = response;
  }
}
