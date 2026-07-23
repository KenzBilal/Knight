import posthog from "posthog-js";

export function identifyUser(userId: string, properties: Record<string, any> = {}) {
  if (!posthog) return;
  posthog.identify(userId, properties);
}

export function track(event: string, properties: Record<string, any> = {}) {
  if (!posthog) return;
  posthog.capture(event, properties);
}
