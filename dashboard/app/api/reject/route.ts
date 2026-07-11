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
    const { id } = await req.json();

    await supabase
      .from("companies")
      .update({ status: "REJECTED" })
      .eq("id", id)
      .eq("org_id", org.id);

    const { data: audit } = await supabase
      .from("audits")
      .select("id")
      .eq("company_id", id)
      .single();

    if (audit) {
      await supabase.from("audit_results").insert({
        audit_id: audit.id,
        org_id: org.id,
        category: "REJECTED",
        raw_data: {},
        issues_found: { rejection_reason: "Manually rejected" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
