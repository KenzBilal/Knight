import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("orgs")
      .select("id, name, slug, plan")
      .eq("id", org.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user, org } = await requireAuthFromToken(tokenMatch[1]);

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Validate slug is URL-safe
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be URL-safe (lowercase alphanumeric with hyphens)" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check requester is owner
    const { data: requester, error: requesterError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (requesterError || !requester) throw new Error("Not a member of this org");
    if (requester.role !== "owner") {
      return NextResponse.json({ error: "Only the owner can update org details" }, { status: 403 });
    }

    // Check slug uniqueness (if changed)
    if (slug !== org.slug) {
      const { data: existing } = await supabase
        .from("orgs")
        .select("id")
        .eq("slug", slug)
        .neq("id", org.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: "This slug is already taken" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("orgs")
      .update({ name, slug, updated_at: new Date().toISOString() })
      .eq("id", org.id)
      .select("id, name, slug, plan")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, org: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
