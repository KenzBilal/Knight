import { NextResponse } from "next/server";
import { createServiceClient } from "./supabase";

/**
 * Check if a feature kill switch is enabled for an org.
 * Returns null if feature is enabled (allow), or NextResponse 403 if disabled (block).
 */
export async function checkKillSwitch(
  flagKey: string,
  orgId: string
): Promise<NextResponse | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("check_feature_flag", {
    flag_key: flagKey,
    org_uuid: orgId,
  });

  if (error) {
    // Fail-open: if RPC fails, allow the feature
    console.error(`[KillSwitch] Failed to check ${flagKey}:`, error);
    return null;
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
 * Check kill switch and return a 403 error response if disabled.
 * Use at the top of API routes before any processing.
 */
export async function requireFeature(
  flagKey: string,
  orgId: string
): Promise<void> {
  const error = await checkKillSwitch(flagKey, orgId);
  if (error) throw new KillSwitchError(error);
}

export class KillSwitchError extends Error {
  response: NextResponse;
  constructor(response: NextResponse) {
    super("Feature disabled");
    this.response = response;
  }
}
