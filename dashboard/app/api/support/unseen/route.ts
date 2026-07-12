import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase(req: NextRequest) {
  const token = req.cookies.get("knight_token")?.value;
  if (!token) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

// GET /api/support/unseen — count tickets with unseen admin replies
export async function GET(req: NextRequest) {
  const supabase = getSupabase(req);
  if (!supabase) return NextResponse.json({ unseenCount: 0 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ unseenCount: 0 });

  // Get user's tickets
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
}
