import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

/**
 * POST /api/plans/revalidate
 * Called by the admin desktop app after saving a plan change.
 * Triggers immediate ISR revalidation of /pricing.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!REVALIDATE_SECRET || auth !== `Bearer ${REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/pricing");

  return NextResponse.json({ ok: true, revalidated: "/pricing" });
}
