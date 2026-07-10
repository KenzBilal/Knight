import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4dea7781609f88ef7dba371c92423f73@o4511712287195136.ingest.de.sentry.io/4511712313671760",

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 0.1,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enabled: process.env.NODE_ENV === "production",
});
