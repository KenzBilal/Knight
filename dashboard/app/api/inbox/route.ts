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

    // Get emails grouped by company
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
          website
        )
      `)
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    // Group by company
    const threads: Record<string, any> = {};
    for (const email of emails || []) {
      const companyId = email.company_id;
      if (!threads[companyId]) {
        threads[companyId] = {
          company: email.companies,
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
