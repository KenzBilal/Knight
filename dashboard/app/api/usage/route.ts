import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();

    // Get current plan from org
    const { data: orgData } = await supabase
      .from("orgs")
      .select("plan")
      .eq("id", org.id)
      .single();

    const { data: override } = await supabase
      .from("user_overrides")
      .select("override_plan, override_leads_limit, override_emails_limit")
      .eq("user_id", user.id)
      .eq("org_id", org.id)
      .maybeSingle();
    const plan = override?.override_plan || orgData?.plan || "free";

    // Get plan limits from plans table
    const { data: planData } = await supabase
      .from("plans")
      .select("lead_limit, email_limit")
      .eq("id", plan)
      .maybeSingle();

    const planLimits = {
      leads: override?.override_leads_limit ?? planData?.lead_limit ?? 50,
      emails: override?.override_emails_limit ?? planData?.email_limit ?? 50,
    };

    // Get current month usage
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("leads_searched, emails_sent")
      .eq("org_id", org.id)
      .eq("period_start", periodStart.toISOString().split("T")[0])
      .maybeSingle();

    return NextResponse.json({
      plan,
      usage: {
        leads: usage?.leads_searched || 0,
        emails: usage?.emails_sent || 0,
      },
      limits: planLimits,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
