import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export const dynamic = "force-dynamic";

const API_ID = parseInt(process.env.TELEGRAM_API_ID || "32257424");
const API_HASH = process.env.TELEGRAM_API_HASH || "4ae0738ebf40cd4b1d5da92f6454667c";

// Generate username variations from company name
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

  // Also try with numbers
  for (let i = 1; i <= 5; i++) {
    variations.push(`${base}${i}`);
    variations.push(`${base}bot${i}`);
  }

  return [...new Set(variations)];
}

// Wait for BotFather response
async function waitForResponse(
  client: TelegramClient,
  botFatherId: any,
  timeoutMs: number = 10000
): Promise<string> {
  const startTime = Date.now();
  let lastMessage = "";

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const messages = await client.getMessages(botFatherId, { limit: 1 });
      if (messages.length > 0) {
        const msg = messages[0];
        if (msg.message && msg.message !== lastMessage) {
          lastMessage = msg.message;
          return msg.message;
        }
      }
    } catch {}
  }

  throw new Error("Timeout waiting for BotFather response");
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { data: config } = await supabase
      .from("org_config")
      .select("telegram_session, telegram_username, company_name")
      .eq("org_id", org.id)
      .single();

    if (!config?.telegram_session) {
      return NextResponse.json({ error: "No Telegram session found" }, { status: 400 });
    }

    const companyName = config.company_name || "MyBot";
    const usernames = generateUsernames(companyName);

    // Connect using user's session
    const client = new TelegramClient(
      new StringSession(config.telegram_session),
      API_ID,
      API_HASH,
      { connectionRetries: 3 }
    );
    await client.connect();

    try {
      // Find BotFather
      const botFather = await client.getEntity("BotFather");
      const botFatherId = botFather.id;

      // Send /newbot command
      await client.sendMessage(botFatherId, { message: "/newbot" });
      await new Promise((r) => setTimeout(r, 2000));

      // Wait for "What name do you want for your bot?"
      const namePrompt = await waitForResponse(client, botFatherId);
      if (!namePrompt.includes("name")) {
        throw new Error("Unexpected BotFather response: " + namePrompt.slice(0, 100));
      }

      // Send bot name (company name)
      await client.sendMessage(botFatherId, { message: companyName });
      await new Promise((r) => setTimeout(r, 2000));

      // Wait for username prompt
      const usernamePrompt = await waitForResponse(client, botFatherId);
      if (!usernamePrompt.includes("username")) {
        throw new Error("Unexpected BotFather response: " + usernamePrompt.slice(0, 100));
      }

      // Try username variations
      let botToken = null;
      let successfulUsername = null;

      for (const username of usernames) {
        try {
          await client.sendMessage(botFatherId, { message: username });
          await new Promise((r) => setTimeout(r, 2000));

          const response = await waitForResponse(client, botFatherId, 5000);

          // Check if successful (contains a token)
          const tokenMatch = response.match(
            /(\d+:[A-Za-z0-9_-]{35})/
          );
          if (tokenMatch) {
            botToken = tokenMatch[1];
            successfulUsername = username;
            break;
          }

          // If username taken, BotFather says something like "Sorry, this username is already taken"
          // Continue to next variation
          console.log(`[CREATE-BOT] Username @${username} taken, trying next...`);
        } catch (err) {
          console.log(`[CREATE-BOT] Failed for @${username}, trying next...`);
        }
      }

      if (!botToken) {
        await client.disconnect();
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

      // Send confirmation to user
      try {
        const userEntity = await client.getEntity(config.telegram_username || "me");
        await client.sendMessage(userEntity.id, {
          message: `🤖 **Bot Created!**

Your Telegram bot has been created automatically:

**Name:** ${companyName}
**Username:** @${successfulUsername}
**Token:** \`${botToken}\`

The bot is now connected to Knight and ready to use.

_You can manage bot settings from your dashboard._`,
        });
      } catch (err) {
        console.warn("[CREATE-BOT] Could not send confirmation to user:", err);
      }

      await client.disconnect();

      return NextResponse.json({
        ok: true,
        username: successfulUsername,
        token: botToken,
      });
    } catch (err: any) {
      await client.disconnect();
      throw err;
    }
  } catch (error: any) {
    console.error("[CREATE-BOT] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
