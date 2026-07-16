import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const API_ID = 32257424;
const API_HASH = "4ae0738ebf40cd4b1d5da92f6454667c";

export const apiCredentials = { apiId: API_ID, apiHash: API_HASH };

export function createClient(sessionString?: string) {
  const session = new StringSession(sessionString || "");
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 2000,
  });
}

// Store pending auth in DB instead of memory (persists across requests)
import { createServiceClient } from "./supabase";

export async function setPendingAuth(orgId: string, data: {
  phone: string;
  phoneCodeHash: string;
}) {
  const supabase = createServiceClient();
  await supabase.from("org_config").upsert({
    org_id: orgId,
    telegram_pending_phone: data.phone,
    telegram_pending_code_hash: data.phoneCodeHash,
    updated_at: new Date().toISOString(),
  });
}

export async function getPendingAuth(orgId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("org_config")
    .select("telegram_pending_phone, telegram_pending_code_hash")
    .eq("org_id", orgId)
    .single();

  if (!data?.telegram_pending_phone || !data?.telegram_pending_code_hash) {
    return null;
  }

  return {
    phone: data.telegram_pending_phone,
    phoneCodeHash: data.telegram_pending_code_hash,
  };
}

export async function deletePendingAuth(orgId: string) {
  const supabase = createServiceClient();
  await supabase.from("org_config").update({
    telegram_pending_phone: null,
    telegram_pending_code_hash: null,
    updated_at: new Date().toISOString(),
  }).eq("org_id", orgId);
}

export const TELEGRAM_API_ID = API_ID;
export const TELEGRAM_API_HASH = API_HASH;
