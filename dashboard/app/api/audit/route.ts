import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const { data: company, error: companyErr } = await supabase
      .from("companies")
      .insert({
        org_id: org.id,
        name: url.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
        website_url: url.startsWith("http") ? url : `https://${url}`,
        status: "NEW",
      })
      .select()
      .single();

    if (companyErr) throw companyErr;

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .insert({
        org_id: org.id,
        type: "SCRAPE",
        status: "PENDING",
        payload: { company_id: company.id, target: url },
      })
      .select()
      .single();

    if (jobErr) throw jobErr;
    return NextResponse.json({ success: true, companyId: company.id, jobId: job.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
