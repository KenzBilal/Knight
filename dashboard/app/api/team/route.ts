import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface TeamMember {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();

    // Fetch org members
    const { data: members, error: membersError } = await supabase
      .from("org_members")
      .select("user_id, role, joined_at")
      .eq("org_id", org.id);

    if (membersError) throw membersError;

    // Fetch user emails via auth admin
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const userMap = new Map(users.map((u) => [u.id, u.email]));

    const membersWithEmail: TeamMember[] = (members || []).map((m) => ({
      user_id: m.user_id,
      email: userMap.get(m.user_id) || "unknown",
      role: m.role,
      joined_at: m.joined_at,
    }));

    // Fetch pending invites
    const { data: invites, error: invitesError } = await supabase
      .from("org_invites")
      .select("id, email, role, created_at, expires_at")
      .eq("org_id", org.id)
      .is("accepted_at", null);

    if (invitesError) throw invitesError;

    return NextResponse.json({
      members: membersWithEmail,
      invites: (invites || []) as PendingInvite[],
      currentUserEmail: user?.email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
