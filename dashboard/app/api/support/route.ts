import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/knight_token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET /api/support — list user's tickets + unseen count
export async function GET(req: Request) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user } = await requireAuthFromToken(token);

    const supabase = createServiceClient();
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

// POST /api/support — create new ticket
export async function POST(req: Request) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user, org } = await requireAuthFromToken(token);

    const body = await req.json();
    const { subject, message, category } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        org_id: org.id,
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
