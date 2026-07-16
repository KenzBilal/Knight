import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const status = url.searchParams.get("status"); // filter by status
    const offset = (page - 1) * PAGE_SIZE;

    const supabase = createServiceClient();
    let query = supabase
      .from("telegram_leads")
      .select("id, username, full_name, category, status, ai_summary, created_at", { count: "exact" })
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return NextResponse.json({
      leads: data || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      hasMore: (count || 0) > offset + PAGE_SIZE,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
