import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface TrackPayload {
  event: string;
  properties?: Record<string, any>;
  distinct_id?: string;
  source?: string;
  session_id?: string;
  timestamp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const token = req.cookies.get("knight_token")?.value;
    const identity = token ? await requireAuthFromToken(token) : null;

    // Support single event or batch
    const events: TrackPayload[] = Array.isArray(body.events) ? body.events : [body];

    if (events.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    // Cap batch at 100
    const batch = events.slice(0, 100);

    if (batch.some((event) => typeof event.event !== "string" || !event.event.trim() || event.event.length > 120)) {
      return NextResponse.json({ error: "Each event needs a name of 1–120 characters" }, { status: 400 });
    }

    const rows = batch.map((e) => ({
      org_id: identity?.org.id || null,
      user_id: identity?.user.id || null,
      event: e.event.trim(),
      properties: e.properties && typeof e.properties === "object" && !Array.isArray(e.properties)
        ? e.properties
        : {},
      distinct_id: identity?.user.id || e.distinct_id || null,
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
    const userIds = identity ? [identity.user.id] : [];
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
