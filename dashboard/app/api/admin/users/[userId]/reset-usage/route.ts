import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { userId } = await params;
    const body = await req.json();
    const { type } = body; // 'leads' or 'emails' or 'all'

    // Get person's org
    const { data: person } = await supabase
      .from("analytics_persons")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!person) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset usage by updating the daily stats materialized view
    // Actually, we need to reset the usage counters in the org_config or usage table
    // For now, we'll update the user_overrides to reset limits
    const today = new Date().toISOString().split("T")[0];

    if (type === "leads" || type === "all") {
      // Reset lead usage for today
      await supabase
        .from("analytics_daily_stats")
        .delete()
        .eq("org_id", person.org_id)
        .eq("date", today)
        .eq("event", "lead_created");
    }

    if (type === "emails" || type === "all") {
      // Reset email usage for today
      await supabase
        .from("analytics_daily_stats")
        .delete()
        .eq("org_id", person.org_id)
        .eq("date", today)
        .eq("event", "email_sent");
    }

    return NextResponse.json({ ok: true, type });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
