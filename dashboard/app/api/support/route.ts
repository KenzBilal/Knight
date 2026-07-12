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

// GET /api/support — list user's tickets + unseen count
export async function GET(req: NextRequest) {
  const supabase = getSupabase(req);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Count unseen tickets (has replies newer than last_seen_at)
  let unseenCount = 0;
  for (const ticket of tickets || []) {
    const { count } = await supabase
      .from("support_replies")
      .select("*", { count: "exact", head: true })
      .eq("ticket_id", ticket.id)
      .gt("created_at", ticket.last_seen_at || ticket.created_at)
      .neq("sender_type", "user");
    if (count && count > 0) unseenCount++;
  }

  return NextResponse.json({ tickets: tickets || [], unseenCount });
}

// POST /api/support — create new ticket
export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { subject, message, category } = body;

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
  }

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "No organization found" }, { status: 400 });

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      org_id: membership.org_id,
      user_id: user.id,
      subject: subject.trim(),
      category: category || "other",
      status: "open",
      priority: "medium",
    })
    .select()
    .single();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });

  // Create initial message
  const { error: replyError } = await supabase
    .from("support_replies")
    .insert({
      ticket_id: ticket.id,
      sender_type: "user",
      sender_id: user.id,
      message: message.trim(),
    });

  if (replyError) return NextResponse.json({ error: replyError.message }, { status: 500 });

  return NextResponse.json({ ticket });
}
