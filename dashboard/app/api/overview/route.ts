import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getPeriodRange(period: string): { start: Date; label: string } {
  const now = new Date();
  switch (period) {
    case "Day": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      return { start, label: "Day" };
    }
    case "Week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start, label: "Week" };
    }
    case "Year": {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      return { start, label: "Year" };
    }
    case "Month":
    default: {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      return { start, label: "Month" };
    }
  }
}

function buildChartData(companies: { created_at: string }[], period: string): { month: string; value: number }[] {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  if (period === "Day") {
    // Last 24 hours by hour
    const buckets: { label: string; count: number }[] = [];
    for (let i = 23; i >= 0; i--) {
      const h = new Date(now);
      h.setHours(h.getHours() - i, 0, 0, 0);
      const label = h.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
      const nextH = new Date(h);
      nextH.setHours(nextH.getHours() + 1);
      const count = companies?.filter(c => {
        const d = new Date(c.created_at);
        return d >= h && d < nextH;
      }).length || 0;
      buckets.push({ label, count });
    }
    // Show every 4th label to avoid crowding
    return buckets.map((b, i) => ({
      month: i % 4 === 0 ? b.label : "",
      value: b.count,
    }));
  }

  if (period === "Week") {
    // Last 7 days by day
    const buckets: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const label = dayNames[d.getDay()];
      const count = companies?.filter(c => {
        const cd = new Date(c.created_at);
        return cd >= d && cd < nextD;
      }).length || 0;
      buckets.push({ label, count });
    }
    return buckets.map(b => ({ month: b.label, value: b.count }));
  }

  if (period === "Year") {
    // Last 12 months by month
    const buckets: { label: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i, 1);
      d.setHours(0, 0, 0, 0);
      const nextM = new Date(d);
      nextM.setMonth(nextM.getMonth() + 1);
      const label = monthNames[d.getMonth()];
      const count = companies?.filter(c => {
        const cd = new Date(c.created_at);
        return cd >= d && cd < nextM;
      }).length || 0;
      buckets.push({ label, count });
    }
    return buckets.map(b => ({ month: b.label, value: b.count }));
  }

  // Month (default) — last 30 days by day
  const buckets: { label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    const label = `${d.getDate()}`;
    const count = companies?.filter(c => {
      const cd = new Date(c.created_at);
      return cd >= d && cd < nextD;
    }).length || 0;
    buckets.push({ label, count });
  }
  // Show every 5th label
  return buckets.map((b, i) => ({
    month: i % 5 === 0 || i === buckets.length - 1 ? b.label : "",
    value: b.count,
  }));
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "Month";
    const { start: periodStart } = getPeriodRange(period);

    const supabase = createServiceClient();

    // Get total prospects (all time)
    const { count: totalProspects } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id);

    // Get active jobs (audits in progress)
    const { count: activeAudits } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "RUNNING");

    // Get emails sent in period
    const { count: emailsSent } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("direction", "outbound")
      .gte("created_at", periodStart.toISOString());

    // Get replies in period
    const { count: replies } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("direction", "inbound")
      .gte("created_at", periodStart.toISOString());

    // Get recent activity (last 10 jobs in period)
    const { data: recentJobs } = await supabase
      .from("jobs")
      .select("id, type, status, created_at, payload")
      .eq("org_id", org.id)
      .gte("created_at", periodStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch companies in period for chart
    const { data: companies } = await supabase
      .from("companies")
      .select("created_at")
      .eq("org_id", org.id)
      .gte("created_at", periodStart.toISOString());

    const chartData = buildChartData(companies || [], period);

    return NextResponse.json({
      totalProspects: totalProspects || 0,
      activeAudits: activeAudits || 0,
      emailsSent: emailsSent || 0,
      replies: replies || 0,
      recentJobs: recentJobs || [],
      chartData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
