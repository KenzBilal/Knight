import { NextResponse } from "next/server";
import { getUser, getOrg } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  const { data } = await supabase
    .from("mcp_api_keys")
    .select("id, label, is_active, last_used_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ keys: data || [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  let label = "Default";
  try {
    const body = await req.json();
    if (body.label) label = body.label;
  } catch {}

  const keyValue = `knight_mcp_${crypto.randomBytes(24).toString("hex")}`;

  const { data, error } = await supabase
    .from("mcp_api_keys")
    .insert({
      org_id: org.id,
      key_value: keyValue,
      label,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: { ...data, key_value: keyValue } });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase
    .from("mcp_api_keys")
    .delete()
    .eq("id", id)
    .eq("org_id", org.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
