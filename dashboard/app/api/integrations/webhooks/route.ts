import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getUser, getOrg } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { planHasFeature } from "@/lib/limits";
import { checkKillSwitch } from "@/lib/kill-switches";

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

  const ksError = await checkKillSwitch("enable-webhooks", org.id);
  if (ksError) return ksError;

  const { data, error } = await supabase
    .from("webhooks")
    .select("id,url,label,events,is_active,last_triggered_at,last_status,created_at,updated_at")
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

  const ksError = await checkKillSwitch("enable-webhooks", org.id);
  if (ksError) return ksError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const input = body as { url?: unknown; label?: unknown; events?: unknown };
  const url = typeof input.url === "string" ? input.url.trim() : "";
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
  if (url.length > 2048) return NextResponse.json({ error: "URL is too long" }, { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
    return NextResponse.json({ error: "Webhook URL must use HTTP or HTTPS without embedded credentials" }, { status: 400 });
  }

  const events = input.events === undefined ? ["audit.completed"] : input.events;
  if (!Array.isArray(events) || events.length === 0 || events.some(event => event !== "audit.completed")) {
    return NextResponse.json({ error: "At least one supported webhook event is required" }, { status: 400 });
  }
  if (input.label !== undefined && typeof input.label !== "string") {
    return NextResponse.json({ error: "Label must be a string" }, { status: 400 });
  }
  const label = typeof input.label === "string" ? input.label.trim().slice(0, 120) || "My Webhook" : "My Webhook";

  const secret = `whk_${randomBytes(32).toString("hex")}`;

  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      org_id: org.id,
      url,
      label,
      events,
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

  const ksError = await checkKillSwitch("enable-webhooks", org.id);
  if (ksError) return ksError;

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
