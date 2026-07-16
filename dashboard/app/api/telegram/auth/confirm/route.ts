import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export const dynamic = "force-dynamic";

const API_ID = parseInt(process.env.TELEGRAM_API_ID || "32257424");
const API_HASH = process.env.TELEGRAM_API_HASH || "4ae0738ebf40cd4b1d5da92f6454667c";
const KNIGHT_BOT_TOKEN = process.env.KNIGHT_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    if (!KNIGHT_BOT_TOKEN) {
      return NextResponse.json({ error: "Knight bot not configured" }, { status: 500 });
    }

    const supabase = createServiceClient();
    const { data: config } = await supabase
      .from("org_config")
      .select("telegram_session, telegram_username, company_name")
      .eq("org_id", org.id)
      .single();

    if (!config?.telegram_session) {
      return NextResponse.json({ error: "No Telegram session found" }, { status: 400 });
    }

    // Connect Knight bot
    const knightBot = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
      connectionRetries: 3,
    });
    await knightBot.start({ botAuthToken: KNIGHT_BOT_TOKEN });

    // Find the user's Telegram chat ID by username
    const username = config.telegram_username;
    if (username) {
      try {
        const entity = await knightBot.getEntity(username);
        const chatId = entity.id;

        // Send confirmation message
        await knightBot.sendMessage(chatId, {
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
    }

    await knightBot.disconnect();

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[CONFIRM] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
