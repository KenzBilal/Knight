import { NextResponse } from "next/server";
import { requireTelegramAuth, TELEGRAM_API_ID, TELEGRAM_API_HASH } from "@/lib/telegram-auth";
import { createServiceClient } from "@/lib/supabase";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export const dynamic = "force-dynamic";

const MAX_USERNAME_ATTEMPTS = 10;

function generateUsernames(companyName: string): string[] {
  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const variations = [
    base,
    `${base}bot`,
    `${base}Bot`,
    `${base}_bot`,
    `${base}Agency`,
    `${base}agent`,
    `${base}ai`,
    `${base}Assistant`,
    `${base}sales`,
    `${base}pro`,
    `${base}official`,
    `${base}_ai`,
    `${base}_agent`,
    `${base}helper`,
    `${base}service`,
  ];

  for (let i = 1; i <= 5; i++) {
    variations.push(`${base}${i}`);
    variations.push(`${base}bot${i}`);
  }

  return [...new Set(variations)].slice(0, MAX_USERNAME_ATTEMPTS);
}

async function waitForResponse(
  client: TelegramClient,
  botFatherId: any,
  lastMsgId: number,
  timeoutMs: number = 10000
): Promise<{ text: string; msgId: number }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const messages = await client.getMessages(botFatherId, { limit: 5 });
      for (const msg of messages) {
        if (msg.id > lastMsgId && msg.message) {
          return { text: msg.message, msgId: msg.id };
        }
      }
    } catch {}
  }

  throw new Error("Timeout waiting for BotFather response");
}

export async function POST(req: Request) {
  let client: TelegramClient | null = null;
  try {
    const { org } = await requireTelegramAuth(req);

    const supabase = createServiceClient();
    const { data: config } = await supabase
      .from("org_config")
      .select("telegram_session, company_name")
      .eq("org_id", org.id)
      .single();

    if (!config?.telegram_session) {
      return NextResponse.json({ error: "No Telegram session found" }, { status: 400 });
    }

    const companyName = config.company_name || "MyBot";
    const usernames = generateUsernames(companyName);

    client = new TelegramClient(
      new StringSession(config.telegram_session),
      TELEGRAM_API_ID,
      TELEGRAM_API_HASH,
      { connectionRetries: 3 }
    );
    await client.connect();

    try {
      const botFather = await client.getEntity("BotFather");
      const botFatherId = botFather.id;

      // Get current max message ID before starting
      const existingMsgs = await client.getMessages(botFatherId, { limit: 1 });
      let lastMsgId = existingMsgs.length > 0 ? existingMsgs[0].id : 0;

      // Send /newbot command
      await client.sendMessage(botFatherId, { message: "/newbot" });
      await new Promise((r) => setTimeout(r, 2000));

      const nameResponse = await waitForResponse(client, botFatherId, lastMsgId);
      lastMsgId = nameResponse.msgId;
      if (!nameResponse.text.includes("name")) {
        throw new Error("Unexpected BotFather response: " + nameResponse.text.slice(0, 100));
      }

      // Send bot name
      await client.sendMessage(botFatherId, { message: companyName });
      await new Promise((r) => setTimeout(r, 2000));

      const usernameResponse = await waitForResponse(client, botFatherId, lastMsgId);
      lastMsgId = usernameResponse.msgId;
      if (!usernameResponse.text.includes("username")) {
        throw new Error("Unexpected BotFather response: " + usernameResponse.text.slice(0, 100));
      }

      // Try username variations
      let botToken = null;
      let successfulUsername = null;

      for (const username of usernames) {
        try {
          await client.sendMessage(botFatherId, { message: username });
          await new Promise((r) => setTimeout(r, 2000));

          const response = await waitForResponse(client, botFatherId, lastMsgId, 5000);
          lastMsgId = response.msgId;

          const tokenMatch = response.text.match(/(\d+:[A-Za-z0-9_-]{35})/);
          if (tokenMatch) {
            botToken = tokenMatch[1];
            successfulUsername = username;
            break;
          }

          console.log(`[CREATE-BOT] Username @${username} taken, trying next...`);
        } catch (err) {
          console.log(`[CREATE-BOT] Failed for @${username}, trying next...`);
        }
      }

      if (!botToken) {
        await client.disconnect();
        client = null;
        return NextResponse.json(
          { error: "Could not create bot - all username variations taken" },
          { status: 400 }
        );
      }

      // Save bot token to org_config
      const { error } = await supabase
        .from("org_config")
        .update({
          telegram_bot_token: botToken,
          updated_at: new Date().toISOString(),
        })
        .eq("org_id", org.id);

      if (error) throw error;

      // Send confirmation to user (without bot token in message)
      try {
        const me = await client.getMe();
        await client.sendMessage(me.id, {
          message: `🤖 **Bot Created!**

Your Telegram bot has been created automatically:

**Name:** ${companyName}
**Username:** @${successfulUsername}

The bot is now connected to Knight and ready to use.

_You can manage bot settings from your dashboard._`,
        });
      } catch (err) {
        console.warn("[CREATE-BOT] Could not send confirmation to user:", err);
      }

      await client.disconnect();
      client = null;

      return NextResponse.json({
        ok: true,
        username: successfulUsername,
      });
    } catch (err: any) {
      if (client) {
        await client.disconnect();
        client = null;
      }
      throw err;
    }
  } catch (error: any) {
    console.error("[CREATE-BOT] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) client.disconnect().catch(() => {});
  }
}
