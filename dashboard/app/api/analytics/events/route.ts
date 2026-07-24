import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("knight_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { org } = await requireAuthFromToken(token);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");
    const eventFilter = searchParams.get("event");
    const sourceFilter = searchParams.get("source");
    const userIdFilter = searchParams.get("user_id");
    const since = searchParams.get("since");

    const supabase = createServiceClient();
    let query = supabase
      .from("analytics_events")
      .select("*", { count: "exact" })
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventFilter) query = query.eq("event", eventFilter);
    if (sourceFilter) query = query.eq("source", sourceFilter);
    if (userIdFilter) query = query.eq("user_id", userIdFilter);
    if (since) query = query.gte("created_at", since);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ events: data || [], total: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
