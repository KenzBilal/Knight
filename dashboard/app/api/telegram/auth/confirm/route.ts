import { NextResponse } from "next/server";
import { requireTelegramAuth, TELEGRAM_API_ID, TELEGRAM_API_HASH } from "@/lib/telegram-auth";
import { createServiceClient } from "@/lib/supabase";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export const dynamic = "force-dynamic";

const KNIGHT_BOT_TOKEN = process.env.KNIGHT_BOT_TOKEN;

export async function POST(req: Request) {
  let userClient: TelegramClient | null = null;
  let knightBot: TelegramClient | null = null;
  try {
    const { org } = await requireTelegramAuth(req);

    if (!KNIGHT_BOT_TOKEN) {
      return NextResponse.json({ error: "Knight bot not configured" }, { status: 500 });
    }

    const supabase = createServiceClient();
    const { data: config } = await supabase
      .from("org_config")
      .select("telegram_session, company_name")
      .eq("org_id", org.id)
      .single();

    if (!config?.telegram_session) {
      return NextResponse.json({ error: "No Telegram session found" }, { status: 400 });
    }

    // Use the user's session to get their own info
    userClient = new TelegramClient(
      new StringSession(config.telegram_session),
      TELEGRAM_API_ID,
      TELEGRAM_API_HASH,
      { connectionRetries: 3 }
    );
    await userClient.connect();
    const me = await userClient.getMe();
    const username = me.username || me.firstName || "user";
    const userId = me.id;
    await userClient.disconnect();
    userClient = null;

    // Connect Knight bot
    knightBot = new TelegramClient(new StringSession(""), TELEGRAM_API_ID, TELEGRAM_API_HASH, {
      connectionRetries: 3,
    });
    await knightBot.start({ botAuthToken: KNIGHT_BOT_TOKEN });

    // Send confirmation message to user
    try {
      await knightBot.sendMessage(userId, {
        message: `✅ **Knight Connected!**

Your Telegram account is now connected to Knight.

🎯 **What happens next:**
• Knight will start finding leads in Telegram groups
• You'll receive approval requests here when leads are found
• AI handles initial conversations automatically

📱 **Your connected account:** @${username}
${config.company_name ? `🏢 **Company:** ${config.company_name}` : ""}

_You can manage everything from your dashboard._`,
      });
      console.log(`[CONFIRM] Sent confirmation to @${username}`);
    } catch (err: any) {
      console.warn(`[CONFIRM] Could not send to @${username}:`, err.message);
    }

    await knightBot.disconnect();
    knightBot = null;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[CONFIRM] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (userClient) userClient.disconnect().catch(() => {});
    if (knightBot) knightBot.disconnect().catch(() => {});
  }
}
