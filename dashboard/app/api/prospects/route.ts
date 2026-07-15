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

    // Get companies with their contacts
    const { data: companies } = await supabase
      .from("companies")
      .select(`
        id,
        name,
        website_url,
        industry,
        lead_score,
        status,
        ai_pitch,
        created_at,
        contacts (
          id,
          email,
          full_name,
          role
        )
      `)
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ companies: companies || [] });
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
