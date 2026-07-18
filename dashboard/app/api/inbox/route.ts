import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import { planHasFeature } from "@/lib/limits";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    if (!planHasFeature(org.plan, "inbox")) {
      return NextResponse.json({ threads: [], error: "Inbox is only available on the Max plan" }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Get emails grouped by company — join through companies for org filtering
    const { data: companiesList } = await supabase
      .from("companies")
      .select("id")
      .eq("org_id", org.id);

    const companyIds = (companiesList || []).map((c) => c.id);
    if (companyIds.length === 0) {
      return NextResponse.json({ threads: [] });
    }

    const { data: emails } = await supabase
      .from("emails")
      .select(`
        id,
        company_id,
        direction,
        subject,
        body_text,
        created_at,
        companies (
          id,
          name,
          website_url
        )
      `)
      .in("company_id", companyIds)
      .order("created_at", { ascending: false });

    // Group by company
    const threads: Record<string, any> = {};
    for (const email of emails || []) {
      const companyId = email.company_id;
      if (!threads[companyId]) {
        const rawCo = (email as any).companies;
          const company = Array.isArray(rawCo) ? rawCo[0] ?? null : rawCo ?? null;
          threads[companyId] = {
          company,
          emails: [],
          lastActivity: email.created_at,
          hasReply: false,
        };
      }
      threads[companyId].emails.push(email);
      if (email.direction === "inbound") {
        threads[companyId].hasReply = true;
      }
    }

    // Sort by last activity
    const sortedThreads = Object.values(threads).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return NextResponse.json({ threads: sortedThreads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
