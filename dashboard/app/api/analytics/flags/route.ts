import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("knight_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireAuthFromToken(token);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("analytics_flags")
      .select("*")
      .order("id");

    if (error) throw error;
    return NextResponse.json({ flags: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
