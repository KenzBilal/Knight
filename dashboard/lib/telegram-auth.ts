import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const API_ID = 2040;
const API_HASH = "b18441a1ff607e10a989891a5462e627";

export const apiCredentials = { apiId: API_ID, apiHash: API_HASH };

export function createClient(sessionString?: string) {
  const session = new StringSession(sessionString || "");
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 2000,
  });
}

// In-memory store for pending auth state (keyed by orgId)
const pendingAuth = new Map<string, {
  client: TelegramClient;
  phoneCodeHash: string;
  phone: string;
  createdAt: number;
}>();

export function setPendingAuth(orgId: string, data: {
  client: TelegramClient;
  phoneCodeHash: string;
  phone: string;
}) {
  pendingAuth.set(orgId, { ...data, createdAt: Date.now() });
}

export function getPendingAuth(orgId: string) {
  const data = pendingAuth.get(orgId);
  if (!data) return null;
  if (Date.now() - data.createdAt > 5 * 60 * 1000) {
    pendingAuth.delete(orgId);
    return null;
  }
  return data;
}

export function deletePendingAuth(orgId: string) {
  pendingAuth.delete(orgId);
}

export const TELEGRAM_API_ID = API_ID;
export const TELEGRAM_API_HASH = API_HASH;
