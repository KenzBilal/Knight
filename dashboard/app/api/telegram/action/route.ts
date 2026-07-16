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

    const supabase = createServiceClient();
    const { leadId, action } = await req.json();
    const id = leadId;

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

    await supabase
      .from("telegram_leads")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("org_id", org.id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
