import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("knight_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user, org } = await requireAuthFromToken(token);
    const { properties } = await req.json();

    const supabase = createServiceClient();

    const { error } = await supabase.from("analytics_persons").upsert(
      {
        user_id: user.id,
        email: user.email || null,
        name: user.name || null,
        org_id: org.id,
        properties: properties && typeof properties === "object" && !Array.isArray(properties) ? properties : {},
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
