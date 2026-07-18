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

    const { data: orgCompanies, error: compErr } = await supabase
      .from("companies")
      .select("id")
      .eq("org_id", org.id);
    if (compErr) throw new Error(compErr.message);
    const companyIds = (orgCompanies || []).map((c) => c.id);

    if (companyIds.length === 0) {
      return NextResponse.json({ audits: [] });
    }

    const { data: audits, error: auditErr } = await supabase
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
    if (auditErr) throw new Error(auditErr.message);

    const auditIds = (audits || []).map((a) => a.id);
    const { data: results, error: resErr } = auditIds.length > 0
      ? await supabase
          .from("audit_results")
          .select("id, audit_id, category, raw_data, issues_found")
          .in("audit_id", auditIds)
      : { data: [], error: null };
    if (resErr) throw new Error(resErr.message);

    const auditsWithResults = (audits || []).map((audit) => {
      const rawCompanies = (audit as any).companies;
      const company = Array.isArray(rawCompanies) ? rawCompanies[0] ?? null : rawCompanies ?? null;
      return {
        id: audit.id,
        company_id: audit.company_id,
        status: audit.status,
        total_score: audit.total_score,
        created_at: audit.created_at,
        company,
        results: (results || []).filter((r) => r.audit_id === audit.id),
      };
    });

    return NextResponse.json({ audits: auditsWithResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
