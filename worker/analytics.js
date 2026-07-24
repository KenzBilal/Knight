// worker/analytics.js — replaces posthog.js
// Custom analytics: Supabase-backed, fail-open, batched events

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
  }
}

/**
 * Check if a feature flag is enabled for an org.
 * Uses local cache with 10s TTL.
 * Fail-open: returns true on error.
 */
export async function isFeatureEnabled(flagKey, orgId) {
  const cacheKey = `${flagKey}:${orgId}`;
  const cached = flagCache.get(cacheKey);

  // Return cached value if still valid
  if (cached && Date.now() < cached.expires) {
    return cached.value;
  }

  const client = getClient();
  if (!client) return true; // fail-open

  try {
    // Use RPC for deterministic rollout
    const { data, error } = await client
      .rpc('check_feature_flag', {
        flag_key: flagKey,
        org_uuid: orgId,
      });

    if (error) {
      console.error(`[Analytics] flag check failed for ${flagKey}: ${error.message}`);
      return true; // fail-open
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
    return true; // fail-open
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
