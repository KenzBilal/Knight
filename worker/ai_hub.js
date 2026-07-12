// Knight worker/ai_hub.js
// Central AI routing: task → provider → key rotation → retry

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { cohereChat } from './providers/cohere.js';
import { geminiChat } from './providers/gemini.js';
import { groqChat } from './providers/groq.js';
import { openrouterChat } from './providers/openrouter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROVIDERS = { cohere: cohereChat, gemini: geminiChat, groq: groqChat, openrouter: openrouterChat };

// In-memory cache for config + keys (refreshed every 60s)
let _configCache = null;
let _keysCache = null;
let _lastFetch = 0;
const CACHE_TTL_MS = 60_000;

// ─── Cache Management ────────────────────────────────────────────────────────

async function refreshCache() {
  const now = Date.now();
  if (_configCache && _keysCache && now - _lastFetch < CACHE_TTL_MS) return;

  const [configRes, keysRes] = await Promise.all([
    supabase.from('ai_config').select('*'),
    supabase.from('ai_keys').select('*').order('created_at', { ascending: true }),
  ]);

  _configCache = configRes.data || [];
  _keysCache = keysRes.data || [];
  _lastFetch = now;
}

// Force refresh (after admin changes)
export async function forceRefresh() {
  _configCache = null;
  _keysCache = null;
  _lastFetch = 0;
  await refreshCache();
}

// ─── Key Rotation ────────────────────────────────────────────────────────────

function getActiveKeysForProvider(provider) {
  const now = new Date();
  return _keysCache.filter(k => {
    if (k.provider !== provider) return false;
    if (!k.is_active) return false;
    // Re-enable if cooldown expired
    if (k.disabled_until && new Date(k.disabled_until) <= now) {
      k.is_active = true;
      k.disabled_until = null;
      k.error_count = 0;
      return true;
    }
    if (k.disabled_until) return false;
    return true;
  });
}

async function markKeyFailed(keyId) {
  const key = _keysCache.find(k => k.id === keyId);
  if (!key) return;

  const cooldown = _configCache.find(c => c.provider === key.provider)?.cooldown_minutes || 30;

  key.is_active = false;
  key.disabled_until = new Date(Date.now() + cooldown * 60_000).toISOString();
  key.error_count = (key.error_count || 0) + 1;

  await supabase.from('ai_keys').update({
    is_active: false,
    disabled_until: key.disabled_until,
    error_count: key.error_count,
  }).eq('id', keyId);
}

async function markKeyUsed(keyId) {
  const key = _keysCache.find(k => k.id === keyId);
  if (key) key.last_used_at = new Date().toISOString();

  await supabase.from('ai_keys').update({
    last_used_at: new Date().toISOString(),
  }).eq('id', keyId);
}

// ─── Core: Complete a Task ───────────────────────────────────────────────────

export async function complete(taskType, messages, opts = {}) {
  await refreshCache();

  const config = _configCache.find(c => c.task_type === taskType);
  if (!config) throw new Error(`[AI Hub] Unknown task type: ${taskType}`);

  const provider = config.provider;
  const model = opts.model || config.model;
  const chatFn = PROVIDERS[provider];
  if (!chatFn) throw new Error(`[AI Hub] Unknown provider: ${provider}`);

  const activeKeys = getActiveKeysForProvider(provider);
  if (activeKeys.length === 0) {
    throw new Error(`[AI Hub] All keys exhausted for provider: ${provider} (task: ${taskType})`);
  }

  // Try each active key
  let lastError = null;
  for (const key of activeKeys) {
    try {
      const result = await chatFn(messages, { ...opts, model }, key.key_value);
      await markKeyUsed(key.id);
      return result;
    } catch (err) {
      lastError = err;
      const isRateLimit = err.message?.includes('429') ||
        err.message?.includes('rate limit') ||
        err.message?.includes('Rate limit') ||
        err.message?.includes('too many requests') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('quota');

      if (isRateLimit) {
        console.warn(`[AI Hub] Key ${key.label} (${key.id.slice(0, 8)}) rate limited. Disabling for ${config.cooldown_minutes}min.`);
        await markKeyFailed(key.id);
        continue; // Try next key
      }

      // Non-rate-limit error: still try next key
      console.warn(`[AI Hub] Key ${key.label} error: ${err.message}. Trying next key...`);
      await markKeyFailed(key.id);
      continue;
    }
  }

  throw new Error(`[AI Hub] All ${activeKeys.length} keys for ${provider} failed on task ${taskType}. Last error: ${lastError?.message}`);
}

// ─── Admin Helpers ───────────────────────────────────────────────────────────

export async function getConfig() {
  await refreshCache();
  return _configCache;
}

export async function getKeys() {
  await refreshCache();
  return _keysCache.map(k => ({
    ...k,
    key_value: k.key_value.slice(0, 6) + '...' + k.key_value.slice(-4),
    cooldown_remaining: k.disabled_until
      ? Math.max(0, Math.round((new Date(k.disabled_until) - Date.now()) / 60_000))
      : 0,
  }));
}

export async function getKeysRaw() {
  await refreshCache();
  return _keysCache;
}

export async function addKey(provider, label, keyValue) {
  const { data, error } = await supabase.from('ai_keys').insert({
    provider,
    label,
    key_value: keyValue,
  }).select().single();
  if (error) throw error;
  await forceRefresh();
  return data;
}

export async function deleteKey(id) {
  await supabase.from('ai_keys').delete().eq('id', id);
  await forceRefresh();
}

export async function toggleKey(id, isActive) {
  await supabase.from('ai_keys').update({ is_active: isActive, disabled_until: null }).eq('id', id);
  await forceRefresh();
}

export async function updateConfig(taskType, provider, model) {
  await supabase.from('ai_config').update({ provider, model, updated_at: new Date().toISOString() }).eq('task_type', taskType);
  await forceRefresh();
}

export async function testProvider(provider, apiKey) {
  const chatFn = PROVIDERS[provider];
  if (!chatFn) throw new Error(`Unknown provider: ${provider}`);

  const testMessages = [{ role: 'user', content: 'Say "ok" in one word.' }];
  const result = await chatFn(testMessages, { temperature: 0 }, apiKey);
  return result.content;
}

export async function getProviderStatus() {
  await refreshCache();
  const providers = ['cohere', 'gemini', 'groq', 'openrouter'];

  return providers.map(p => {
    const keys = _keysCache.filter(k => k.provider === p);
    const active = keys.filter(k => k.is_active && !k.disabled_until);
    const cooling = keys.filter(k => k.disabled_until && new Date(k.disabled_until) > new Date());
    const tasks = _configCache.filter(c => c.provider === p);

    return {
      provider: p,
      total_keys: keys.length,
      active_keys: active.length,
      cooling_keys: cooling.length,
      assigned_tasks: tasks.map(t => t.task_type),
    };
  });
}
