import { PostHog } from 'posthog-node';

let client = null;

export function getPostHog() {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new PostHog(apiKey, {
      host: 'https://us.i.posthog.com',
    });
  }
  return client;
}

export async function captureEvent(distinctId, event, properties = {}) {
  const ph = getPostHog();
  if (!ph) return;
  try {
    await ph.capture({ distinctId, event, properties });
  } catch (err) {
    console.error(`[PostHog] capture failed: ${err.message}`);
  }
}

export async function isFeatureEnabled(flagKey, distinctId) {
  const ph = getPostHog();
  if (!ph) return true; // default to enabled if PostHog not configured
  try {
    const isEnabled = await ph.isFeatureEnabled(flagKey, distinctId);
    return isEnabled;
  } catch (err) {
    console.error(`[PostHog] feature flag check failed: ${err.message}`);
    return true; // default to enabled on error
  }
}

export async function flush() {
  const ph = getPostHog();
  if (ph) {
    await ph.shutdown();
  }
}
