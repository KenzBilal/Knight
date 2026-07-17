import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATES = [
  {
    id: "default-initial",
    name: "Cold Outreach",
    type: "initial",
    subject: "Quick question about {{company_name}}'s website",
    body: `Hi {{contact_name}},

I came across {{company_name}} while researching {{industry}} businesses, and I noticed a few things on your website that might be costing you customers.

We work with businesses like yours to fix conversion-killing issues — things like slow load times, confusing navigation, or mobile experiences that don't quite work.

I'd love to show you exactly what we found. Would you be open to a quick 10-minute call this week?

Best,
{{sender_name}} Team`,
    is_default: true,
  },
  {
    id: "default-follow_up_1",
    name: "Follow-up #1",
    type: "follow_up_1",
    subject: "Re: Quick question about {{company_name}}'s website",
    body: `Hi {{contact_name}},

Just wanted to follow up on my last email. I know things get busy.

We recently helped a similar {{industry}} business increase their leads by 40% just by fixing a few website issues. I'd love to show you what we found for {{company_name}}.

Would a quick call work for you this week?

Best,
{{sender_name}} Team`,
    is_default: true,
  },
  {
    id: "default-follow_up_2",
    name: "Follow-up #2",
    type: "follow_up_2",
    subject: "Last thought on {{company_name}}",
    body: `Hi {{contact_name}},

I don't want to be a pest, so this will be my last email.

If you're interested in seeing how we can help {{company_name}} get more customers from your website, just reply to this email and I'll set up a quick call.

No hard feelings if now isn't the right time.

Best,
{{sender_name}} Team`,
    is_default: true,
  },
  {
    id: "default-re_engagement",
    name: "Re-engagement",
    type: "re_engagement",
    subject: "Still need help with {{company_name}}'s website?",
    body: `Hi {{contact_name}},

It's been a while since we last connected. I wanted to reach out because we've been helping businesses in the {{industry}} space improve their online presence and get more customers.

If you're still looking to grow {{company_name}}, I'd love to chat. We've got some new strategies that could work well for your business.

Would you be open to a quick catch-up?

Best,
{{sender_name}} Team`,
    is_default: true,
  },
  {
    id: "default-reply",
    name: "Interested Reply",
    type: "reply",
    subject: "Re: {{subject}}",
    body: `Hi {{contact_name}},

Thanks for getting back to us! I'm glad you're interested.

I'd love to show you exactly what we found for {{company_name}}. It'll only take about 10 minutes.

You can book a time here: {{calendly_link}}

Looking forward to chatting!

Best,
{{sender_name}} Team`,
    is_default: true,
  },
];

async function tableExists(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("email_templates")
      .select("id")
      .limit(1);
    // If no error or different error than "relation not found", table exists
    if (!error) return true;
    if (error?.code === "42P01" || error?.message?.includes("does not exist")) return false;
    // Other errors (RLS etc) mean table exists
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const exists = await tableExists(supabase);

    if (!exists) {
      return NextResponse.json({ templates: DEFAULT_TEMPLATES, defaults: true });
    }

    const { data: templates, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // If no custom templates, return defaults but allow creation
    if (!templates || templates.length === 0) {
      return NextResponse.json({ templates: DEFAULT_TEMPLATES, defaults: false });
    }

    return NextResponse.json({ templates, defaults: false });
  } catch {
    return NextResponse.json({ templates: DEFAULT_TEMPLATES, defaults: true });
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const exists = await tableExists(supabase);

    if (!exists) {
      return NextResponse.json(
        { error: "Email templates table not yet created. Please run the migration in Supabase dashboard." },
        { status: 503 }
      );
    }

    const { name, type, subject, body, is_default } = await req.json();

    if (!name || !type || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (is_default) {
      await supabase
        .from("email_templates")
        .update({ is_default: false })
        .eq("org_id", org.id)
        .eq("type", type)
        .eq("is_default", true);
    }

    const { data: template, error } = await supabase
      .from("email_templates")
      .insert({
        org_id: org.id,
        name,
        type,
        subject,
        body,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template });
  } catch (_error) {
    return NextResponse.json({ error: (_error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { id, name, type, subject, body, is_default } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    if (is_default && type) {
      await supabase
        .from("email_templates")
        .update({ is_default: false })
        .eq("org_id", org.id)
        .eq("type", type)
        .eq("is_default", true)
        .neq("id", id);
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (subject) updateData.subject = subject;
    if (body) updateData.body = body;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data: template, error } = await supabase
      .from("email_templates")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template });
  } catch (_error) {
    return NextResponse.json({ error: (_error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    // Don't delete default templates
    if (id.startsWith("default-")) {
      return NextResponse.json({ error: "Cannot delete default templates" }, { status: 400 });
    }

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: (_error as Error).message }, { status: 500 });
  }
}
