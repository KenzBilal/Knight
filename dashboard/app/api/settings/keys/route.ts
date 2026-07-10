import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: Fetch org API keys
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { data: keys } = await supabase
      .from("org_api_keys")
      .select("provider")
      .eq("org_id", org.id);

    // Return which providers have keys (not the actual keys)
    const providers = (keys || []).map(k => k.provider);

    return NextResponse.json({ 
      hasKeys: providers.length > 0,
      providers 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save org API keys
export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { cohere_key, gemini_key, openrouter_key } = await req.json();

    const supabase = createServiceClient();

    // Upsert each key
    const keysToSave = [
      { provider: "cohere", key: cohere_key },
      { provider: "gemini", key: gemini_key },
      { provider: "openrouter", key: openrouter_key },
    ].filter(k => k.key); // Only save non-empty keys

    for (const { provider, key } of keysToSave) {
      await supabase
        .from("org_api_keys")
        .upsert({
          org_id: org.id,
          provider,
          key_encrypted: key, // In production, encrypt this
        }, { onConflict: "org_id,provider" });
    }

    // Delete keys that were cleared
    const providedProviders = keysToSave.map(k => k.provider);
    const allProviders = ["cohere", "gemini", "openrouter"];
    const deletedProviders = allProviders.filter(p => !providedProviders.includes(p));

    for (const provider of deletedProviders) {
      await supabase
        .from("org_api_keys")
        .delete()
        .eq("org_id", org.id)
        .eq("provider", provider);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Clear all org API keys
export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    await supabase
      .from("org_api_keys")
      .delete()
      .eq("org_id", org.id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
