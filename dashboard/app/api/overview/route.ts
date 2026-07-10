import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();

    // Get total prospects (companies)
    const { count: totalProspects } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id);

    // Get active jobs (audits in progress)
    const { count: activeAudits } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "RUNNING");

    // Get emails sent this month
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const { count: emailsSent } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("direction", "outbound")
      .gte("created_at", periodStart.toISOString());

    // Get replies received
    const { count: replies } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("direction", "inbound");

    // Get recent activity (last 10 jobs)
    const { data: recentJobs } = await supabase
      .from("jobs")
      .select("id, type, status, created_at, payload")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalProspects: totalProspects || 0,
      activeAudits: activeAudits || 0,
      emailsSent: emailsSent || 0,
      replies: replies || 0,
      recentJobs: recentJobs || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
