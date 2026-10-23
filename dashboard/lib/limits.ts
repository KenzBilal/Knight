import { createServiceClient } from "./supabase";

type ActionType = "lead" | "email";

// Map action type to usage field name
const ACTION_TO_FIELD: Record<ActionType, string> = {
  lead: "lead_limit",
  email: "email_limit",
};

const ACTION_TO_USAGE_FIELD: Record<ActionType, string> = {
  lead: "leads_searched",
  email: "emails_sent",
};

// Fallback if plans table is empty
const FALLBACK_LIMITS: Record<string, { lead_limit: number; email_limit: number }> = {
  free: { lead_limit: 50, email_limit: 50 },
  starter: { lead_limit: 1000, email_limit: 1000 },
  max: { lead_limit: -1, email_limit: -1 },
};

export type PlanFeature = "telegram" | "byok" | "pitch" | "drip" | "inbox" | "webhooks" | "templates";

const PLAN_FEATURES: Record<string, PlanFeature[]> = {
  free: [],
  starter: ["pitch", "webhooks", "templates"],
  max: ["telegram", "byok", "pitch", "drip", "inbox", "webhooks", "templates"],
};

export function planHasFeature(plan: string, feature: PlanFeature): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export function getPlanLimits(plan: string): { leads: number; emails: number } {
  const limits = FALLBACK_LIMITS[plan] || FALLBACK_LIMITS.free;
  return { leads: limits.lead_limit, emails: limits.email_limit };
}

export async function checkLimits(
  orgId: string,
  action: ActionType,
  userId?: string
): Promise<{ allowed: boolean; reason?: string; usage?: number; limit?: number }> {
  const supabase = createServiceClient();

  // Get org plan
  const { data: org } = await supabase
    .from("orgs")
    .select("plan")
    .eq("id", orgId)
    .single();

  let plan = org?.plan || "free";

  const { data: override } = userId
    ? await supabase
        .from("user_overrides")
        .select("override_plan, override_leads_limit, override_emails_limit")
        .eq("user_id", userId)
        .eq("org_id", orgId)
        .maybeSingle()
    : { data: null };
  if (override?.override_plan) plan = override.override_plan;

  // Get plan limits from plans table
  const { data: planData } = await supabase
    .from("plans")
    .select("lead_limit, email_limit")
    .eq("id", plan)
    .maybeSingle();

  const limits = planData || FALLBACK_LIMITS[plan] || FALLBACK_LIMITS.free;
  const limitField = ACTION_TO_FIELD[action] as keyof typeof limits;
  const overrideLimit = action === "lead" ? override?.override_leads_limit : override?.override_emails_limit;
  const limit = overrideLimit ?? limits[limitField] ?? 50;

  // Unlimited
  if (limit === -1) {
    return { allowed: true };
  }

  // Get current usage for this month
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const usageField = ACTION_TO_USAGE_FIELD[action];
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select(usageField)
    .eq("org_id", orgId)
    .eq("period_start", periodStart.toISOString().split("T")[0])
    .maybeSingle();

  const currentUsage = (usage as unknown as Record<string, number>)?.[usageField] || 0;

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `Free plan limit: ${limit} ${action}s/month. Upgrade for unlimited.`,
      usage: currentUsage,
      limit,
    };
  }

  return { allowed: true, usage: currentUsage, limit };
}

export async function incrementUsage(orgId: string, action: ActionType): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("increment_usage", {
    p_org_id: orgId,
    p_action: action,
  });
}

export async function getUsage(orgId: string): Promise<{ leads: number; emails: number }> {
  const supabase = createServiceClient();

  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("leads_searched, emails_sent")
    .eq("org_id", orgId)
    .eq("period_start", periodStart.toISOString().split("T")[0])
    .maybeSingle();

  return {
    leads: usage?.leads_searched || 0,
    emails: usage?.emails_sent || 0,
  };
}
