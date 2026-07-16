import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/refresh
 * Silently refreshes the Supabase session using the stored refresh_token.
 * Returns 401 if no refresh token exists or if it is invalid.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("knight_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      return NextResponse.json({ error: "Session refresh failed" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("knight_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("knight_refresh", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[auth/refresh]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
