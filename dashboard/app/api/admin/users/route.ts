import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    if (!(await getPlatformAdmin(tokenMatch[1]))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceClient();

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
    const { data: overrides } = userIds.length ? await supabase
      .from("user_overrides")
      .select("*")
      .in("user_id", userIds) : { data: [] };

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
