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

// GET /api/support/[id] — get ticket + all replies
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase(req);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Get ticket (must belong to user)
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (ticketError || !ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // Get replies
  const { data: replies, error: repliesError } = await supabase
    .from("support_replies")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (repliesError) return NextResponse.json({ error: repliesError.message }, { status: 500 });

  // Mark as seen
  await supabase
    .from("support_tickets")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ticket, replies: replies || [] });
}

// PATCH /api/support/[id] — add reply or update ticket
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase(req);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body = await req.json();

  // Verify ticket belongs to user
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // Add reply
  if (body.message) {
    const { error } = await supabase
      .from("support_replies")
      .insert({
        ticket_id: id,
        sender_type: "user",
        sender_id: user.id,
        message: body.message.trim(),
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update ticket timestamp
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
