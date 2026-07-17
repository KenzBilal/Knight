import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function authenticate(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const key = auth.slice(7);

  const { data } = await supabase
    .from("mcp_api_keys")
    .select("org_id")
    .eq("key_value", key)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  await supabase
    .from("mcp_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_value", key);

  return data.org_id;
}

const TOOLS = [
  {
    name: "audit_site",
    description: "Run a full website audit. Returns score, issues, contacts, and AI pitch.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "Website URL to audit" },
      },
      required: ["url"],
    },
  },
  {
    name: "list_leads",
    description: "List all leads (companies) for your organization.",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: { type: "string", description: "Filter by status: NEW, PITCHED, REPLIED, REJECTED" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "get_audit",
    description: "Get a specific audit result by company website URL.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "Website URL" },
      },
      required: ["url"],
    },
  },
  {
    name: "send_pitch",
    description: "Send a pitch email to a lead.",
    inputSchema: {
      type: "object" as const,
      properties: {
        company_id: { type: "string", description: "Company ID" },
        email: { type: "string", description: "Recipient email" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body" },
      },
      required: ["company_id", "email", "subject", "body"],
    },
  },
];

async function handleTool(name: string, args: Record<string, unknown>, orgId: string) {
  switch (name) {
    case "audit_site": {
      const url = args.url as string;
      if (!url) return { error: "url is required" };

      const { data: existing } = await supabase
        .from("companies")
        .select("id, name, website_url, lead_score, status, industry, created_at")
        .eq("org_id", orgId)
        .eq("website_url", url)
        .single();

      if (existing) {
        const { data: audit } = await supabase
          .from("audits")
          .select("id, total_score, created_at")
          .eq("org_id", orgId)
          .eq("company_id", existing.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { data: result } = await supabase
          .from("audit_results")
          .select("raw_data, issues_found")
          .eq("audit_id", audit?.id || "")
          .single();

        return {
          company: existing,
          audit: audit || null,
          result: result || null,
        };
      }

      const { data: job } = await supabase.from("jobs").insert({
        org_id: orgId,
        type: "SCRAPE",
        status: "PENDING",
        payload: { target: url },
      }).select().single();

      return { status: "audit_queued", job_id: job?.id, message: "Audit started. Use get_audit to check results." };
    }

    case "list_leads": {
      const limit = (args.limit as number) || 20;
      let query = supabase
        .from("companies")
        .select("id, name, website_url, lead_score, status, industry, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (args.status) query = query.eq("status", args.status as string);

      const { data } = await query;
      return { leads: data || [], count: data?.length || 0 };
    }

    case "get_audit": {
      const url = args.url as string;
      if (!url) return { error: "url is required" };

      const { data: company } = await supabase
        .from("companies")
        .select("id, name, website_url, lead_score, status, industry")
        .eq("org_id", orgId)
        .eq("website_url", url)
        .single();

      if (!company) return { error: "Company not found" };

      const { data: audit } = await supabase
        .from("audits")
        .select("id, total_score, created_at")
        .eq("org_id", orgId)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: result } = await supabase
        .from("audit_results")
        .select("raw_data, issues_found")
        .eq("audit_id", audit?.id || "")
        .single();

      return { company, audit: audit || null, result: result || null };
    }

    case "send_pitch": {
      const { company_id, email, subject, body } = args;
      if (!company_id || !email || !subject || !body) return { error: "All fields required" };

      const { data: orgConfig } = await supabase.from("org_config").select("*").eq("org_id", orgId).single();

      const { error } = await supabase.from("emails").insert({
        org_id: orgId,
        company_id,
        direction: "outbound",
        to_email: email,
        subject,
        body,
        status: "QUEUED",
        sender_name: orgConfig?.company_name || "Knight",
        sender_email: orgConfig?.sender_email || "hello@knight.app",
      });

      if (error) return { error: error.message };
      return { status: "queued", message: `Pitch queued for ${email}` };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function POST(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await req.json();

  if (body.method === "tools/list") {
    return NextResponse.json({ tools: TOOLS });
  }

  if (body.method === "tools/call") {
    const { name, arguments: args } = body.params || {};
    if (!name) return NextResponse.json({ error: "Tool name required" }, { status: 400 });

    const result = await handleTool(name, args || {}, orgId);
    return NextResponse.json({
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    });
  }

  return NextResponse.json({ error: "Unknown method" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    name: "Knight MCP Server",
    version: "1.0.0",
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
  });
}
