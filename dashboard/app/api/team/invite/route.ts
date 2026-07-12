import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    if (role !== "admin" && role !== "member") {
      return NextResponse.json({ error: "Role must be 'admin' or 'member'" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check inviter permissions
    const { data: inviter, error: inviterError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (inviterError || !inviter) throw new Error("Not a member of this org");
    if (inviter.role !== "owner" && inviter.role !== "admin") {
      return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { error: insertError } = await supabase
      .from("org_invites")
      .insert({
        org_id: org.id,
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt,
      });

    if (insertError) throw insertError;

    // Send invitation email if RESEND_API_KEY is set
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/team/accept?token=${token}`;

        await resend.emails.send({
          from: "Knight <onboarding@resend.dev>",
          to: email,
          subject: `You've been invited to join ${org.name} on Knight`,
          html: `
            <h2>You've been invited!</h2>
            <p>You've been invited to join <strong>${org.name}</strong> on Knight as a <strong>${role}</strong>.</p>
            <p><a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Accept Invitation</a></p>
            <p style="margin-top:16px;color:#666;">This invitation expires in 7 days.</p>
          `,
        });
      } catch {
        // Email sending failed but invite was created
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const body = await req.json();
    const { invite_id } = body;

    if (!invite_id) {
      return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify inviter has permission
    const { data: inviter, error: inviterError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (inviterError || !inviter) throw new Error("Not a member of this org");
    if (inviter.role !== "owner" && inviter.role !== "admin") {
      return NextResponse.json({ error: "Only owners and admins can cancel invitations" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("org_invites")
      .delete()
      .eq("id", invite_id)
      .eq("org_id", org.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
