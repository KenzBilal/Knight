import { NextResponse } from "next/server";
import { createClient, apiCredentials, setAuthClient } from "@/lib/telegram-auth";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Create client and KEEP it connected — must use same client for signIn
    const client = createClient();
    await client.connect();

    const sentCode = await client.sendCode(apiCredentials, phone);

    // Store client in memory for verify step
    setAuthClient(org.id, client);

    return NextResponse.json({
      ok: true,
      phoneCodeHash: sentCode.phoneCodeHash,
      message: "SMS code sent to your Telegram",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send code" },
      { status: 500 }
    );
  }
}
