// lib/analytics.ts — custom analytics, replaces posthog-js
// All events go through /api/analytics/track -> Supabase

let _userId: string | null = null;
let _orgId: string | null = null;
const _sessionId: string = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

/**
 * Identify the current user. Call once after login.
 */
export function identifyUser(
  userId: string,
  properties: Record<string, any> = {}
) {
  _userId = userId;
  if (properties.org_id) _orgId = properties.org_id;

  // Fire-and-forget identify call
  fetch("/api/analytics/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      email: properties.email,
      name: properties.name,
      org_id: properties.org_id,
      properties,
    }),
  }).catch(() => {});
}

/**
 * Track a custom event.
 */
export function track(
  event: string,
  properties: Record<string, any> = {}
) {
  // Fire-and-forget track call
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      properties,
      user_id: _userId,
      org_id: _orgId,
      session_id: _sessionId,
      source: "dashboard",
    }),
  }).catch(() => {});
}

/**
 * Flush any pending events (no-op, events are sent immediately).
 */
export function flush() {
  // No-op: events are sent immediately via fetch
}
