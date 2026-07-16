import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    // Verify origin matches host (CSRF protection)
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { leadId, action } = await req.json();
    const id = leadId;

    if (!id || !action) {
      return NextResponse.json({ error: "leadId and action required" }, { status: 400 });
    }

    let newStatus: string;
    if (action === "approve") {
      newStatus = "APPROVED";
    } else if (action === "decline") {
      newStatus = "REJECTED";
    } else if (action === "takeover") {
      newStatus = "HUMAN_TAKEOVER";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabase
      .from("telegram_leads")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
