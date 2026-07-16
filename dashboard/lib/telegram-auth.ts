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

// Store connected clients in memory (keyed by orgId)
// Must use SAME client for sendCode + signIn — Telegram ties auth state to connection
const authClients = new Map<string, TelegramClient>();

export function setAuthClient(orgId: string, client: TelegramClient) {
  // Clean up old client if exists
  const old = authClients.get(orgId);
  if (old) old.disconnect().catch(() => {});
  authClients.set(orgId, client);
}

export function getAuthClient(orgId: string): TelegramClient | undefined {
  return authClients.get(orgId);
}

export function deleteAuthClient(orgId: string) {
  const client = authClients.get(orgId);
  if (client) client.disconnect().catch(() => {});
  authClients.delete(orgId);
}

export const TELEGRAM_API_ID = API_ID;
export const TELEGRAM_API_HASH = API_HASH;
