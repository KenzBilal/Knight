import { NextResponse } from "next/server";
import { getUser, getOrg } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { planHasFeature } from "@/lib/limits";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "Webhooks require Starter plan" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhooks: data });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "Webhooks require Starter plan" }, { status: 403 });
  }

  const body = await req.json();
  const { url, label, events } = body;

  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  try { new URL(url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const secret = `whk_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;

  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      org_id: org.id,
      url,
      label: label || "My Webhook",
      events: events || ["audit.completed"],
      secret,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhook: data });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getOrg(user.id);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  if (!planHasFeature(org.plan, "webhooks")) {
    return NextResponse.json({ error: "PLAN_REQUIRED", message: "Webhooks require Starter plan" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("org_id", org.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
