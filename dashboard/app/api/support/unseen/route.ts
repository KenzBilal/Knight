import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/knight_token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET /api/support/unseen — count tickets with unseen admin replies
export async function GET(req: Request) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ unseenCount: 0 });
    const { user } = await requireAuthFromToken(token);

    const supabase = createServiceClient();

    // Get user's open/in-progress tickets
    const { data: tickets } = await supabase
      .from("support_tickets")
      .select("id, last_seen_at, created_at")
      .eq("user_id", user.id)
      .in("status", ["open", "in-progress"]);

    if (!tickets?.length) return NextResponse.json({ unseenCount: 0 });

    let unseenCount = 0;
    for (const ticket of tickets) {
      const since = ticket.last_seen_at || ticket.created_at;
      const { count } = await supabase
        .from("support_replies")
        .select("*", { count: "exact", head: true })
        .eq("ticket_id", ticket.id)
        .gt("created_at", since)
        .neq("sender_type", "user");
      if (count && count > 0) unseenCount++;
    }

    return NextResponse.json({ unseenCount });
  } catch {
    return NextResponse.json({ unseenCount: 0 });
  }
}
