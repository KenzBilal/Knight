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
    const days = parseInt(searchParams.get("days") || "30");
    const supabase = createServiceClient();

    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Total events
    const { count: totalEvents } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .gte("created_at", since);

    // Unique users
    const { data: uniqueUsersData } = await supabase
      .from("analytics_events")
      .select("user_id")
      .eq("org_id", org.id)
      .gte("created_at", since)
      .not("user_id", "is", null);

    const uniqueUsers = new Set(uniqueUsersData?.map((r) => r.user_id)).size;

    // Events today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: eventsToday } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .gte("created_at", todayStart.toISOString());

    // Top events
    const { data: topEvents } = await supabase
      .from("analytics_top_events")
      .select("event, count, last_seen")
      .eq("org_id", org.id)
      .order("count", { ascending: false })
      .limit(10);

    // Daily chart (last N days)
    const { data: dailyData } = await supabase
      .from("analytics_daily_stats")
      .select("date, event, count")
      .eq("org_id", org.id)
      .gte("date", new Date(Date.now() - days * 86400000).toISOString().split("T")[0])
      .order("date");

    // Aggregate daily into chart format
    const dailyMap: Record<string, number> = {};
    for (const row of dailyData || []) {
      const d = row.date;
      dailyMap[d] = (dailyMap[d] || 0) + row.count;
    }
    const chartData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Active flags count
    const { count: activeFlags } = await supabase
      .from("analytics_flags")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    // Total flags
    const { count: totalFlags } = await supabase
      .from("analytics_flags")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      totalEvents: totalEvents || 0,
      uniqueUsers,
      eventsToday: eventsToday || 0,
      topEvents: topEvents || [],
      chartData,
      activeFlags: activeFlags || 0,
      totalFlags: totalFlags || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
