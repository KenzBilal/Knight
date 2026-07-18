import { NextResponse } from "next/server";
import { getUser, getOrg } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { planHasFeature } from "@/lib/limits";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function keyPrefix(key: string): string {
  return key.slice(0, 8) + "..." + key.slice(-4);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "MCP requires Starter plan" }, { status: 403 });
  }

  const { data } = await supabase
    .from("mcp_api_keys")
    .select("id, label, is_active, key_value, last_used_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  // Return prefix only — full key never returned after creation
  const keys = (data || []).map(k => ({
    ...k,
    key_value: keyPrefix(k.key_value),
  }));

  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "MCP requires Starter plan" }, { status: 403 });
  }

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

  // Return full key ONLY at creation time
  return NextResponse.json({ key: { ...data, key_value: keyValue } });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "MCP requires Starter plan" }, { status: 403 });
  }

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
