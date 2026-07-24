import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user_id, email, name, org_id, properties } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from("analytics_persons").upsert(
      {
        user_id,
        email: email || null,
        name: name || null,
        org_id: org_id || null,
        properties: properties || {},
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[analytics/identify] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
