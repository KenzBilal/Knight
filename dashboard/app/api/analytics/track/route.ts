import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface TrackPayload {
  event: string;
  properties?: Record<string, any>;
  distinct_id?: string;
  user_id?: string;
  org_id?: string;
  source?: string;
  session_id?: string;
  timestamp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();

    // Support single event or batch
    const events: TrackPayload[] = Array.isArray(body.events) ? body.events : [body];

    if (events.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    // Cap batch at 100
    const batch = events.slice(0, 100);

    const rows = batch.map((e) => ({
      org_id: e.org_id || null,
      user_id: e.user_id || null,
      event: e.event,
      properties: e.properties || {},
      distinct_id: e.distinct_id || null,
      source: e.source || "dashboard",
      session_id: e.session_id || null,
      created_at: e.timestamp || new Date().toISOString(),
    }));

    const { error } = await supabase.from("analytics_events").insert(rows);

    if (error) {
      console.error("[analytics/track] insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update person's last_seen_at if user_id provided
    const userIds = [...new Set(rows.filter((r) => r.user_id).map((r) => r.user_id))];
    for (const uid of userIds) {
      await supabase
        .from("analytics_persons")
        .upsert(
          { user_id: uid, last_seen_at: new Date().toISOString() },
          { onConflict: "user_id", ignoreDuplicates: false }
        );
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err: any) {
    console.error("[analytics/track] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
