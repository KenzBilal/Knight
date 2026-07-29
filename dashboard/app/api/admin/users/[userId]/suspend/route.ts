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
    const { user: adminUser } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { userId } = await params;
    const body = await req.json();
    const { suspend, reason } = body;

    // Get person's org
    const { data: person } = await supabase
      .from("analytics_persons")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!person) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert suspension status
    const { data, error } = await supabase
      .from("user_overrides")
      .upsert({
        user_id: userId,
        org_id: person.org_id,
        is_suspended: suspend,
        suspension_reason: reason || null,
        overridden_by: adminUser.email,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, is_suspended: data.is_suspended });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
