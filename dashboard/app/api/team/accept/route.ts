import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user } = await requireAuthFromToken(tokenMatch[1]);

    const url = new URL(req.url);
    const inviteToken = url.searchParams.get("token");

    if (!inviteToken) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from("org_invites")
      .select("*")
      .eq("token", inviteToken)
      .is("accepted_at", null)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 });
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check email matches
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "This invitation is for a different email address" }, { status: 403 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", invite.org_id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of this organization" }, { status: 400 });
    }

    // Add user to org_members
    const { error: memberError } = await supabase
      .from("org_members")
      .insert({
        org_id: invite.org_id,
        user_id: user.id,
        role: invite.role,
        joined_at: new Date().toISOString(),
      });

    if (memberError) throw memberError;

    // Mark invite as accepted
    const { error: updateError } = await supabase
      .from("org_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateError) throw updateError;

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
