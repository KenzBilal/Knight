import { createServiceClient } from "./supabase";

// Plan limits
const PLAN_LIMITS: Record<string, { leads: number; emails: number }> = {
  free: { leads: 50, emails: 50 },
  starter: { leads: Infinity, emails: Infinity },
  pro: { leads: Infinity, emails: Infinity },
  agency: { leads: Infinity, emails: Infinity },
};

type ActionType = "lead" | "email";

// Map action type to usage field name
const ACTION_TO_FIELD: Record<ActionType, keyof typeof PLAN_LIMITS.free> = {
  lead: "leads",
  email: "emails",
};

export async function checkLimits(
  orgId: string,
  action: ActionType
): Promise<{ allowed: boolean; reason?: string; usage?: number; limit?: number }> {
  const supabase = createServiceClient();

  // Get org plan
  const { data: org } = await supabase
    .from("orgs")
    .select("plan")
    .eq("id", orgId)
    .single();

  const plan = org?.plan || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const field = ACTION_TO_FIELD[action];

  // Paid plans have unlimited
  if (limits[field] === Infinity) {
    return { allowed: true };
  }

  // Get current usage for this month
  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("leads_searched, emails_sent")
    .eq("org_id", orgId)
    .eq("period_start", periodStart.toISOString().split("T")[0])
    .single();

  const currentUsage = field === "leads" 
    ? (usage?.leads_searched || 0) 
    : (usage?.emails_sent || 0);

  const limit = limits[field];

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `Free plan limit: ${limit} ${field}/month. Upgrade to Pro for unlimited.`,
      usage: currentUsage,
      limit,
    };
  }

  return { allowed: true, usage: currentUsage, limit };
}

export async function incrementUsage(orgId: string, action: ActionType): Promise<void> {
  const supabase = createServiceClient();

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodStartStr = periodStart.toISOString().split("T")[0];

  // Use RPC to atomically increment usage
  await supabase.rpc("increment_usage", {
    p_org_id: orgId,
    p_action: action,
  });
}

export async function getUsage(orgId: string): Promise<{ leads: number; emails: number }> {
  const supabase = createServiceClient();

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("leads_searched, emails_sent")
    .eq("org_id", orgId)
    .eq("period_start", periodStart.toISOString().split("T")[0])
    .single();

  return {
    leads: usage?.leads_searched || 0,
    emails: usage?.emails_sent || 0,
  };
}
