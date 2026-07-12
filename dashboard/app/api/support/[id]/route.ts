import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/knight_token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET /api/support/[id] — get ticket + all replies
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user } = await requireAuthFromToken(token);

    const { id } = await params;
    const supabase = createServiceClient();

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/support/[id] — add reply or update ticket
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user } = await requireAuthFromToken(token);

    const { id } = await params;
    const body = await req.json();

    const supabase = createServiceClient();

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
