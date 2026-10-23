// worker/analytics.js — Supabase-backed analytics + feature flags
// Custom analytics: Supabase-backed feature flags and batched events

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
const flagCache = new Map(); // key -> { value: boolean, expires: number }
const eventBuffer = [];       // buffered events
let flushTimer = null;

const FLAG_CACHE_TTL = 10_000;  // 10s
const FLUSH_INTERVAL = 5_000;   // 5s
const MAX_BUFFER = 50;
const USER_OVERRIDE_FIELDS = {
  'enable-discovery': 'override_discovery',
  'enable-osint': 'override_osint',
  'enable-ai-pitching': 'override_ai_pitching',
  'enable-webhooks': 'override_webhooks',
  'enable-auto-email': 'override_auto_email',
  'enable-telegram-userbot': 'override_telegram_userbot',
};

function getClient() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Capture an event. Buffers up to 50 events, flushes every 5s.
 */
export function captureEvent(orgId, event, properties = {}) {
  const client = getClient();
  if (!client) return;

  eventBuffer.push({
    org_id: orgId,
    event,
    properties,
    source: 'worker',
    created_at: new Date().toISOString(),
  });

  // Flush if buffer full
  if (eventBuffer.length >= MAX_BUFFER) {
    flushEvents();
  }

  // Start flush timer if not running
  if (!flushTimer) {
    flushTimer = setInterval(flushEvents, FLUSH_INTERVAL);
    // Don't keep process alive for flushing
    if (flushTimer.unref) flushTimer.unref();
  }
}

/**
 * Flush buffered events to Supabase.
 */
async function flushEvents() {
  if (eventBuffer.length === 0) return;

  const client = getClient();
  if (!client) return;

  const batch = eventBuffer.splice(0, MAX_BUFFER);

  try {
    const { error } = await client
      .from('analytics_events')
      .insert(batch);

    if (error) {
      console.error(`[Analytics] flush failed: ${error.message}`);
      // Re-add failed events to buffer (up to limit)
      if (eventBuffer.length < MAX_BUFFER * 2) {
        eventBuffer.unshift(...batch);
      }
    }
  } catch (err) {
    console.error(`[Analytics] flush error: ${err.message}`);
    if (eventBuffer.length < MAX_BUFFER * 2) {
      eventBuffer.unshift(...batch);
    }
  }
}

/**
 * Check if a feature flag is enabled for an org.
 * Fail closed: disabled when the database cannot verify the flag.
 */
export async function isFeatureEnabled(flagKey, orgId, userId) {
  const cacheKey = `${flagKey}:${orgId}:${userId || 'org'}`;
  const cached = flagCache.get(cacheKey);

  // Return cached value if still valid
  if (cached && Date.now() < cached.expires) {
    return cached.value;
  }

  const client = getClient();
  if (!client) return false;

  try {
    const overrideField = USER_OVERRIDE_FIELDS[flagKey];
    if (userId && overrideField) {
      const { data: override, error: overrideError } = await client
        .from('user_overrides')
        .select(overrideField)
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .maybeSingle();

      if (overrideError) {
        console.error(`[Analytics] user override check failed for ${flagKey}: ${overrideError.message}`);
        return false;
      }
      if (override && override[overrideField] !== null) {
        const enabled = override[overrideField] === true;
        flagCache.set(cacheKey, { value: enabled, expires: Date.now() + FLAG_CACHE_TTL });
        return enabled;
      }
    }

    // Use RPC for deterministic rollout
    const { data, error } = await client
      .rpc('check_feature_flag', {
        flag_key: flagKey,
        org_uuid: orgId,
      });

    if (error) {
      console.error(`[Analytics] flag check failed for ${flagKey}: ${error.message}`);
      return false;
    }

    const enabled = data === true;

    // Cache result
    flagCache.set(cacheKey, {
      value: enabled,
      expires: Date.now() + FLAG_CACHE_TTL,
    });

    return enabled;
  } catch (err) {
    console.error(`[Analytics] flag check error: ${err.message}`);
    return false;
  }
}

/**
 * Flush all buffered events and shut down.
 */
export async function flush() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flushEvents();
}
