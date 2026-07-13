import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Validate secret
    const auth = req.headers.get("authorization");
    if (!REVALIDATE_SECRET || auth !== `Bearer ${REVALIDATE_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { section, content } = body as { section: string; content: unknown };

    if (!section || content === undefined) {
      return NextResponse.json(
        { error: "Missing section or content" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("landing_content")
      .upsert({ section, content, updated_at: new Date().toISOString() });

    if (error) throw error;

    // Trigger ISR revalidation on the landing page
    revalidatePath("/");

    return NextResponse.json({ ok: true }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
