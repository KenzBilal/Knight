import { NextResponse } from "next/server";
import { getPendingAuth, deletePendingAuth, apiCredentials, createClient } from "@/lib/telegram-auth";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { code, password } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code required" }, { status: 400 });
    }

    // Get pending auth from DB (persists across requests)
    const pending = await getPendingAuth(org.id);
    if (!pending) {
      return NextResponse.json(
        { error: "No pending auth. Please request a new code." },
        { status: 400 }
      );
    }

    // Create a fresh client for this request
    const client = createClient();
    await client.connect();

    try {
      await client.signInUser(apiCredentials, {
        phoneNumber: async () => pending.phone,
        phoneCode: async () => code,
        password: password ? async () => password : undefined,
        onError: (err) => { throw err; },
      });

      const sessionString = client.session.save();
      const me = await client.getMe();
      const username = me.username || me.firstName || pending.phone;

      const supabase = createServiceClient();
      const { error } = await supabase
        .from("org_config")
        .upsert({
          org_id: org.id,
          telegram_session: sessionString,
          telegram_username: username,
          telegram_mode: "userbot",
          telegram_phone: pending.phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Clear pending auth from DB
      await deletePendingAuth(org.id);

      await client.disconnect();

      return NextResponse.json({
        ok: true,
        username,
        message: "Telegram connected successfully",
      });
    } catch (err: any) {
      await client.disconnect();

      // Keep pending auth in DB so user can retry with password
      if (err.message?.includes("SESSION_PASSWORD_NEEDED")) {
        return NextResponse.json(
          { error: "2FA_PASSWORD_REQUIRED", message: "Enter your 2FA password" },
          { status: 400 }
        );
      }
      // For other errors, clear pending auth
      await deletePendingAuth(org.id);
      throw err;
    }
  } catch (error: any) {
    const message = error.message?.includes("PHONE_CODE_INVALID")
      ? "Invalid code. Please try again."
      : error.message || "Failed to verify code";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
