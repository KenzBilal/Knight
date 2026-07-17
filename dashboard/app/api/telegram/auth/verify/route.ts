import { NextResponse } from "next/server";
import { getAuthEntry, deleteAuthClient, requireTelegramAuth } from "@/lib/telegram-auth";
import { createServiceClient } from "@/lib/supabase";
import { Api } from "telegram";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { computeCheck } from "telegram/Password.js";

export const dynamic = "force-dynamic";

async function sendWelcomeMessage(telegramUserId: any) {
  const botToken = process.env.KNIGHT_BOT_TOKEN;
  if (!botToken) return;

  try {
    const API_ID = parseInt(process.env.TELEGRAM_API_ID!);
    const API_HASH = process.env.TELEGRAM_API_HASH!;
    const bot = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 2 });
    await bot.start({ botAuthToken: botToken });

    await bot.sendMessage(Number(telegramUserId), {
      message: `Hey! Welcome to Knight 🚀

Your Telegram is now connected. Here's what I'll do for you:

• Find leads in Telegram groups automatically
• Respond to DMs with AI-powered conversations
• Send you approval requests when a lead is ready

You're all set — I'm already working.`,
    });

    await bot.disconnect();
  } catch (e) {
    console.error("[WELCOME] Failed to send welcome message:", e);
  }
}

export async function POST(req: Request) {
  try {
    const { org } = await requireTelegramAuth(req);

    // Gate: must have company details before connecting Telegram
    const supabase = createServiceClient();
    const { data: config } = await supabase
      .from("org_config")
      .select("company_name")
      .eq("org_id", org.id)
      .single();

    if (!config?.company_name) {
      return NextResponse.json(
        { error: "COMPLETE_PROFILE_FIRST", message: "Complete your company profile before connecting Telegram" },
        { status: 400 }
      );
    }

    const { code, password } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    // Get the auth entry (client + phoneCodeHash + phone) from server-side store
    const entry = getAuthEntry(org.id);
    if (!entry) {
      return NextResponse.json(
        { error: "Session expired. Please request a new code." },
        { status: 400 }
      );
    }

    const { client, phoneCodeHash, phone } = entry;

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
        .update({
          telegram_session: sessionString,
          telegram_phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("org_id", org.id);

      if (error) throw error;

      deleteAuthClient(org.id);

      // Send welcome message from Knight bot
      sendWelcomeMessage(me.id);

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
          const accountPassword = await client.invoke(new Api.account.GetPassword());
          const passwordCheck = await computeCheck(accountPassword, password);

          await client.invoke(
            new Api.auth.CheckPassword({
              password: passwordCheck,
            })
          );

          const sessionString = client.session.save();
          const me = await client.getMe();
          const username = me.username || me.firstName || phone;

          const supabase = createServiceClient();
          const { error } = await supabase
            .from("org_config")
            .update({
              telegram_session: sessionString,
              telegram_phone: phone,
              updated_at: new Date().toISOString(),
            })
            .eq("org_id", org.id);

          if (error) throw error;

          deleteAuthClient(org.id);

          // Send welcome message from Knight bot
          sendWelcomeMessage(me.id);

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
