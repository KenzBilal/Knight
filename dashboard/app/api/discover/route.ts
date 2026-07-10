import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import { checkLimits, incrementUsage } from "@/lib/limits";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    // Check usage limits
    const limits = await checkLimits(org.id, "lead");
    if (!limits.allowed) {
      return NextResponse.json(
        { error: limits.reason, usage: limits.usage, limit: limits.limit },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const { keyword, location } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        org_id: org.id,
        type: "DISCOVER",
        status: "PENDING",
        payload: { keyword, location },
      })
      .select()
      .single();

    if (error) throw error;

    // Increment usage after successful job creation
    await incrementUsage(org.id, "lead");

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
