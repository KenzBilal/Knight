import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getOrgFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/knight_token=([^;]+)/);
  if (!tokenMatch) throw new Error("Unauthorized");
  const { org } = await requireAuthFromToken(tokenMatch[1]);
  return org;
}

export async function GET(req: Request) {
  try {
    const org = await getOrgFromRequest(req);
    const supabase = createServiceClient();

    const [companiesRes, auditsRes, pitchesRes, jobsRes] = await Promise.all([
      supabase.from("companies").select("id", { count: "exact", head: true }).eq("org_id", org.id),
      supabase.from("audits").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("status", "RUNNING"),
      supabase.from("audit_results").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("category", "AI_PITCH"),
      supabase.from("jobs").select("*").eq("org_id", org.id).order("created_at", { ascending: false }).limit(12),
    ]);

    const engineRes = await supabase.from("engine_control").select("*").eq("org_id", org.id).single();

    return NextResponse.json({
      stats: {
        totalProspects: companiesRes.count || 0,
        activeAudits: auditsRes.count || 0,
        pitchesReady: pitchesRes.count || 0,
      },
      engine: engineRes.data || { org_id: org.id, is_running: false },
      jobs: jobsRes.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
