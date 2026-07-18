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

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    const { data: companies, count } = await supabase
      .from("companies")
      .select(`
        id,
        name,
        website_url,
        logo_url,
        industry,
        lead_score,
        status,
        ai_pitch,
        created_at,
        contacts (
          id,
          email,
          full_name,
          role,
          bio
        )
      `, { count: 'exact' })
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({ companies: companies || [], total: count ?? 0, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { companyId, status } = await req.json();

    if (!companyId || !status) {
      return NextResponse.json({ error: "Missing companyId or status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("companies")
      .update({ status })
      .eq("id", companyId)
      .eq("org_id", org.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify company belongs to this org
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("org_id", org.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get all audit IDs for this company
    const { data: audits } = await supabase
      .from("audits")
      .select("id")
      .eq("company_id", companyId);

    const auditIds = (audits || []).map(a => a.id);

    // Cascade delete in correct order
    // 1. audit_results (depends on audits)
    if (auditIds.length > 0) {
      await supabase.from("audit_results").delete().in("audit_id", auditIds);
    }

    // 2. audits (depends on companies)
    await supabase.from("audits").delete().eq("company_id", companyId);

    // 3. contacts (depends on companies)
    await supabase.from("contacts").delete().eq("company_id", companyId);

    // 4. emails (depends on companies)
    await supabase.from("emails").delete().eq("company_id", companyId);

    // 5. jobs (company_id is in JSON payload)
    await supabase.from("jobs").delete().eq("org_id", org.id).contains("payload", { company_id: companyId });

    // 6. companies (the company itself)
    await supabase.from("companies").delete().eq("id", companyId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
