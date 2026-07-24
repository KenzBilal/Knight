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
    const query = searchParams.get("search") || "";
    const personId = searchParams.get("person_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const supabase = createServiceClient();

    // If person_id provided, return their events
    if (personId) {
      const { data: person } = await supabase
        .from("analytics_persons")
        .select("*")
        .eq("id", personId)
        .single();

      const { data: events } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("user_id", person?.user_id)
        .order("created_at", { ascending: false })
        .limit(100);

      return NextResponse.json({ person, events: events || [] });
    }

    // Search persons by email
    if (query.trim()) {
      const { data, error } = await supabase
        .from("analytics_persons")
        .select("*")
        .eq("org_id", org.id)
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .order("last_seen_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return NextResponse.json({ persons: data || [] });
    }

    // No query - return recent persons
    const { data, error } = await supabase
      .from("analytics_persons")
      .select("*")
      .eq("org_id", org.id)
      .order("last_seen_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ persons: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
