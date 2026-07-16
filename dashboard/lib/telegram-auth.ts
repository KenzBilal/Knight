import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const API_ID = parseInt(process.env.TELEGRAM_API_ID || "32257424");
const API_HASH = process.env.TELEGRAM_API_HASH || "4ae0738ebf40cd4b1d5da92f6454667c";

export const apiCredentials = { apiId: API_ID, apiHash: API_HASH };

export function createClient(sessionString?: string) {
  const session = new StringSession(sessionString || "");
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 2000,
  });
}

// ─── Auth Clients + phoneCodeHash Store ────────────────────────────────────────
// Store connected clients in memory (keyed by orgId)
// Must use SAME client for sendCode + signIn — Telegram ties auth state to connection
interface AuthEntry {
  client: TelegramClient;
  phoneCodeHash: string;
  phone: string;
  createdAt: number;
}

const MAX_AUTH_CLIENTS = 50;
const AUTH_TTL_MS = 5 * 60 * 1000; // 5 minutes

const authEntries = new Map<string, AuthEntry>();

function evictOldest() {
  if (authEntries.size <= MAX_AUTH_CLIENTS) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, entry] of authEntries) {
    if (entry.createdAt < oldestTime) {
      oldestTime = entry.createdAt;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    const entry = authEntries.get(oldestKey);
    entry?.client.disconnect().catch(() => {});
    authEntries.delete(oldestKey);
  }
}

export function setAuthClient(orgId: string, client: TelegramClient, phoneCodeHash: string, phone: string) {
  // Clean up old client if exists
  const old = authEntries.get(orgId);
  if (old) old.client.disconnect().catch(() => {});
  evictOldest();
  authEntries.set(orgId, { client, phoneCodeHash, phone, createdAt: Date.now() });
}

export function getAuthEntry(orgId: string): AuthEntry | undefined {
  const entry = authEntries.get(orgId);
  if (!entry) return undefined;
  // Check TTL
  if (Date.now() - entry.createdAt > AUTH_TTL_MS) {
    entry.client.disconnect().catch(() => {});
    authEntries.delete(orgId);
    return undefined;
  }
  return entry;
}

export function deleteAuthClient(orgId: string) {
  const entry = authEntries.get(orgId);
  if (entry) entry.client.disconnect().catch(() => {});
  authEntries.delete(orgId);
}

// Periodic cleanup of expired entries (runs every 60s)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of authEntries) {
      if (now - entry.createdAt > AUTH_TTL_MS) {
        entry.client.disconnect().catch(() => {});
        authEntries.delete(key);
      }
    }
  }, 60_000);
}

// ─── Shared Auth Helper ────────────────────────────────────────────────────────
import { requireAuthFromToken } from "./auth";

export async function requireTelegramAuth(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/knight_token=([^;]+)/);
  if (!tokenMatch) throw new Error("Unauthorized");
  return requireAuthFromToken(tokenMatch[1]);
}

export const TELEGRAM_API_ID = API_ID;
export const TELEGRAM_API_HASH = API_HASH;
