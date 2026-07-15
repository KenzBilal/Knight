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

    // Get company IDs for this org
    const { data: orgCompanies } = await supabase
      .from("companies")
      .select("id")
      .eq("org_id", org.id);
    const companyIds = (orgCompanies || []).map((c) => c.id);

    if (companyIds.length === 0) {
      return NextResponse.json({ audits: [] });
    }

    // Get audits with company info
    const { data: audits } = await supabase
      .from("audits")
      .select(`
        id,
        company_id,
        status,
        total_score,
        created_at,
        companies (
          id,
          name,
          website_url,
          industry
        )
      `)
      .in("company_id", companyIds)
      .order("created_at", { ascending: false });

    // Get audit results for these audits
    const auditIds = (audits || []).map((a) => a.id);
    const { data: results } = auditIds.length > 0
      ? await supabase
          .from("audit_results")
          .select("id, audit_id, category, raw_data, issues_found")
          .in("audit_id", auditIds)
      : { data: [] };

    // Merge results into audits
    const auditsWithResults = (audits || []).map((audit) => ({
      ...audit,
      results: (results || []).filter((r) => r.audit_id === audit.id),
    }));

    return NextResponse.json({ audits: auditsWithResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
