import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture all traces in development so you can see
  // detailed performance data in the dashboard, and
  // keep a lower sample rate in production.
  tracesSampleRate: isProd ? 0.2 : 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
});
