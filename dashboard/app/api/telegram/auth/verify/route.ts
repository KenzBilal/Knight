import { NextResponse } from "next/server";
import { apiCredentials, createClient } from "@/lib/telegram-auth";
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

    const client = createClient();
    await client.connect();

    try {
      // Use raw API to avoid signInUser calling sendCode again
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

      await client.disconnect();

      return NextResponse.json({
        ok: true,
        username,
        message: "Telegram connected successfully",
      });
    } catch (err: any) {
      await client.disconnect();

      // Handle 2FA — need to use signInPassword instead
      if (err.message?.includes("SESSION_PASSWORD_NEEDED") || err.constructor?.name === "SessionPasswordNeededError") {
        if (!password) {
          return NextResponse.json(
            { error: "2FA_PASSWORD_REQUIRED", message: "Enter your 2FA password" },
            { status: 400 }
          );
        }

        // Retry with password
        const client2 = createClient();
        await client2.connect();
        try {
          await client2.invoke(
            new Api.auth.SignIn({
              phoneNumber: phone,
              phoneCodeHash: phoneCodeHash,
              phoneCode: code,
            })
          );
        } catch (innerErr: any) {
          if (innerErr.message?.includes("SESSION_PASSWORD_NEEDED") || innerErr.constructor?.name === "SessionPasswordNeededError") {
            // Now send the password
            await client2.invoke(
              new Api.auth.CheckPassword({
                password: password,
              })
            );
          } else {
            throw innerErr;
          }
        }

        const sessionString = client2.session.save();
        const me = await client2.getMe();
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

        await client2.disconnect();

        return NextResponse.json({
          ok: true,
          username,
          message: "Telegram connected successfully",
        });
      }

      throw err;
    }
  } catch (error: any) {
    const message = error.message?.includes("PHONE_CODE_INVALID")
      ? "Invalid code. Please try again."
      : error.message || "Failed to verify code";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
