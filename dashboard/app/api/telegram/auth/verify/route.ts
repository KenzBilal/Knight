import { NextResponse } from "next/server";
import { getAuthClient, deleteAuthClient } from "@/lib/telegram-auth";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { Api } from "telegram";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { code, password, phone, phoneCodeHash } = await req.json();
    if (!code || !phone || !phoneCodeHash) {
      return NextResponse.json(
        { error: "Code, phone, and phoneCodeHash required" },
        { status: 400 }
      );
    }

    // Get the SAME client from start step — auth state is tied to it
    const client = getAuthClient(org.id);
    if (!client) {
      return NextResponse.json(
        { error: "Session expired. Please request a new code." },
        { status: 400 }
      );
    }

    try {
      // Use raw API to sign in with the code
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCodeHash: phoneCodeHash,
          phoneCode: code,
        })
      );

      const sessionString = client.session.save();
      const me = await client.getMe();
      const username = me.username || me.firstName || phone;

      const supabase = createServiceClient();
      const { error } = await supabase
        .from("org_config")
        .upsert({
          org_id: org.id,
          telegram_session: sessionString,
          telegram_username: username,
          telegram_mode: "userbot",
          telegram_phone: phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      deleteAuthClient(org.id);

      return NextResponse.json({
        ok: true,
        username,
        message: "Telegram connected successfully",
      });
    } catch (err: any) {
      // Handle 2FA
      if (err.message?.includes("SESSION_PASSWORD_NEEDED") || err.constructor?.name === "SessionPasswordNeededError") {
        if (!password) {
          // Keep client alive for password retry
          return NextResponse.json(
            { error: "2FA_PASSWORD_REQUIRED", message: "Enter your 2FA password" },
            { status: 400 }
          );
        }

        try {
          await client.invoke(
            new Api.auth.CheckPassword({
              password: password,
            })
          );

          const sessionString = client.session.save();
          const me = await client.getMe();
          const username = me.username || me.firstName || phone;

          const supabase = createServiceClient();
          await supabase
            .from("org_config")
            .upsert({
              org_id: org.id,
              telegram_session: sessionString,
              telegram_username: username,
              telegram_mode: "userbot",
              telegram_phone: phone,
              updated_at: new Date().toISOString(),
            });

          deleteAuthClient(org.id);

          return NextResponse.json({
            ok: true,
            username,
            message: "Telegram connected successfully",
          });
        } catch (pwErr: any) {
          deleteAuthClient(org.id);
          throw pwErr;
        }
      }

      deleteAuthClient(org.id);
      throw err;
    }
  } catch (error: any) {
    const message = error.message?.includes("PHONE_CODE_INVALID")
      ? "Invalid code. Please try again."
      : error.message?.includes("PHONE_CODE_EXPIRED")
      ? "Code expired. Please request a new code."
      : error.message || "Failed to verify code";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
