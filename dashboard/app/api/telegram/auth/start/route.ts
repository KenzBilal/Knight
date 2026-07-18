import { NextResponse } from "next/server";
import { createClient, apiCredentials, setAuthClient, requireTelegramAuth } from "@/lib/telegram-auth";
import { createServiceClient } from "@/lib/supabase";
import { planHasFeature } from "@/lib/limits";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let client: ReturnType<typeof createClient> | null = null;
  try {
    const { org } = await requireTelegramAuth(req);

    if (!planHasFeature(org.plan, "telegram")) {
      return NextResponse.json(
        { error: "PLAN_REQUIRED", message: "Telegram is only available on the Max plan" },
        { status: 403 }
      );
    }

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

    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Create client and KEEP it connected — must use same client for signIn
    client = createClient();
    await client.connect();

    const sentCode = await client.sendCode(apiCredentials, phone);

    // Store client + phoneCodeHash in memory (server-side, not exposed to client)
    setAuthClient(org.id, client, sentCode.phoneCodeHash, phone);

    // Mark client as stored so finally doesn't disconnect it
    client = null;

    return NextResponse.json({
      ok: true,
      message: "SMS code sent to your Telegram",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send code" },
      { status: 500 }
    );
  } finally {
    // Disconnect client if it wasn't stored (failure case)
    if (client) client.disconnect().catch(() => {});
  }
}
