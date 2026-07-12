import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const body = await req.json();
    const { member_id, role } = body;

    if (!member_id || !role) {
      return NextResponse.json({ error: "Member ID and role are required" }, { status: 400 });
    }

    if (role !== "admin" && role !== "member") {
      return NextResponse.json({ error: "Role must be 'admin' or 'member'" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check that the requester is the owner
    const { data: requester, error: requesterError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (requesterError || !requester) throw new Error("Not a member of this org");
    if (requester.role !== "owner") {
      return NextResponse.json({ error: "Only owners can change member roles" }, { status: 403 });
    }

    // Cannot change your own role
    if (member_id === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("org_members")
      .update({ role })
      .eq("org_id", org.id)
      .eq("user_id", member_id);

    if (updateError) throw updateError;

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
    const { member_id } = body;

    if (!member_id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check that the requester is the owner
    const { data: requester, error: requesterError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (requesterError || !requester) throw new Error("Not a member of this org");
    if (requester.role !== "owner") {
      return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
    }

    // Cannot remove yourself
    if (member_id === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself from the org" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("org_members")
      .delete()
      .eq("org_id", org.id)
      .eq("user_id", member_id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
