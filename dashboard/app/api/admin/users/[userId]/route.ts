import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user: adminUser } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { userId } = await params;

    // Get person
    const { data: person, error: personErr } = await supabase
      .from("analytics_persons")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (personErr || !person) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get overrides
    const { data: overrides } = await supabase
      .from("user_overrides")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get org info
    const { data: org } = await supabase
      .from("orgs")
      .select("id, plan, name")
      .eq("id", person.org_id)
      .single();

    // Get recent events (last 50)
    const { data: events } = await supabase
      .from("analytics_events")
      .select("id, event, properties, source, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get usage stats (events today)
    const today = new Date().toISOString().split("T")[0];
    const { count: eventsToday } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00Z`);

    // Get org's config for limits
    const { data: orgConfig } = await supabase
      .from("org_config")
      .select("daily_email_limit")
      .eq("org_id", person.org_id)
      .single();

    return NextResponse.json({
      person,
      overrides: overrides || null,
      org: org || null,
      events: events || [],
      stats: {
        eventsToday: eventsToday || 0,
        totalEvents: events?.length || 0,
      },
      limits: {
        dailyEmails: orgConfig?.daily_email_limit || 20,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { user: adminUser } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { userId } = await params;
    const body = await req.json();

    // Get the person to find org_id
    const { data: person } = await supabase
      .from("analytics_persons")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!person) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert overrides
    const overrideFields: Record<string, any> = {};
    const allowedFields = [
      "override_discovery", "override_osint", "override_ai_pitching",
      "override_webhooks", "override_auto_email", "override_telegram_userbot",
      "override_plan", "override_leads_limit", "override_emails_limit",
      "is_suspended", "suspension_reason",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        overrideFields[field] = body[field];
      }
    }

    overrideFields.user_id = userId;
    overrideFields.org_id = person.org_id;
    overrideFields.overridden_by = adminUser.email;
    overrideFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("user_overrides")
      .upsert(overrideFields, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ overrides: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
