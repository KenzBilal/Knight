import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { getPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("knight_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await getPlatformAdmin(token))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const supabase = createServiceClient();

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.active !== undefined) update.active = body.active;
    if (body.rollout_percentage !== undefined) update.rollout_percentage = body.rollout_percentage;
    if (body.name !== undefined) update.name = body.name;

    const { data, error } = await supabase
      .from("analytics_flags")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ flag: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
