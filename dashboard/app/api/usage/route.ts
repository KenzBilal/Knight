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

    // Get current plan from org
    const { data: orgData } = await supabase
      .from("orgs")
      .select("plan")
      .eq("id", org.id)
      .single();

    const plan = orgData?.plan || "free";

    // Get plan limits from plans table
    const { data: planData } = await supabase
      .from("plans")
      .select("lead_limit, email_limit")
      .eq("id", plan)
      .single();

    const planLimits = {
      leads: planData?.lead_limit ?? 50,
      emails: planData?.email_limit ?? 50,
    };

    // Get current month usage
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("leads_searched, emails_sent")
      .eq("org_id", org.id)
      .eq("period_start", periodStart.toISOString().split("T")[0])
      .single();

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
