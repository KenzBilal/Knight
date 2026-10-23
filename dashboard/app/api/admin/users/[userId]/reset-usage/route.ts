import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    if (!(await getPlatformAdmin(tokenMatch[1]))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { userId } = await params;
    const body = await req.json();
    const { type } = body; // 'leads' or 'emails' or 'all'
    if (!["leads", "emails", "all"].includes(type)) {
      return NextResponse.json({ error: "type must be leads, emails, or all" }, { status: 400 });
    }

    // Get person's org
    const { data: person } = await supabase
      .from("analytics_persons")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!person) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Quotas are organization-scoped; reset atomically to avoid racing sends.
    const { error } = await supabase.rpc("reset_usage", {
      p_org_id: person.org_id,
      p_action: type,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, type });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
