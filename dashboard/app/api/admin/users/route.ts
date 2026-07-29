import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user } = await requireAuthFromToken(tokenMatch[1]);

    // Only admins/owners can access
    const supabase = createServiceClient();
    const { data: membership } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const orgId = url.searchParams.get("org_id");

    if (!email && !orgId) {
      return NextResponse.json({ error: "email or org_id required" }, { status: 400 });
    }

    // Search analytics_persons
    let query = supabase
      .from("analytics_persons")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(50);

    if (email) {
      query = query.ilike("email", `%${email}%`);
    }
    if (orgId) {
      query = query.eq("org_id", orgId);
    }

    const { data: persons, error } = await query;
    if (error) throw error;

    // Get overrides for each person
    const userIds = (persons || []).map(p => p.user_id);
    const { data: overrides } = await supabase
      .from("user_overrides")
      .select("*")
      .in("user_id", userIds);

    const overrideMap = new Map((overrides || []).map(o => [o.user_id, o]));

    // Get usage stats
    const result = (persons || []).map(p => ({
      ...p,
      overrides: overrideMap.get(p.user_id) || null,
    }));

    return NextResponse.json({ users: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
