# Quantum Suites AI - Copilot Instructions

## Architecture Overview

This is a **Next.js 16 App Router** SaaS application for website compliance scanning with tiered subscription plans. Key integrations:
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database**: PostgreSQL via Prisma with `@prisma/adapter-pg` and pooling
- **Payments**: Stripe subscription webhooks
# Quantum Suites AI — Copilot Instructions

## Big picture
- Next.js 16 App Router SaaS for compliance scanning (Tailwind CSS 4).
- Auth: Clerk. On auth, ensure a `User` row exists via `getOrCreateUser(clerkId, email)` (special-cases `admin@quantumsuites-ai.com` as `ADMIN` + `agency`). See `lib/getOrCreateUser.ts`.
- DB: PostgreSQL via Prisma 7 with the PG adapter + shared pool (`lib/db.ts`). `User.plan` is stored as a string; normalize to `Plan` keys (`lib/plans.ts`).
- Scans: `Website` + `ScanJob` are the source of truth (`prisma/schema.prisma`). Route handlers should call `services/scanService.ts` (`createScan` → `queueScanJob` → `executeScan`).
- Scanner engine: `lib/scanner/engine.ts` orchestrates fetch + accessibility + compliance checks and computes score/risk.

## Developer workflows
- Dev/build/lint: `npm run dev` | `npm run build` | `npm run lint`.
- Prisma client: generated on install (`postinstall`: `prisma generate`).
- Migrations: local `npx prisma migrate dev --name <desc>`; prod `npx prisma migrate deploy` (DB notes in `DATABASE_SETUP.md`).
- Seed compliance rules: `npm run seed:regulations` (`scripts/seed-regulations.cjs`).

## Environment variables (full list used in repo)
- Database: `DATABASE_URL`
- Auth (Clerk): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_STARTER`, `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`, `NEXT_PUBLIC_STRIPE_PRICE_AGENCY`
- App URLs: `NEXT_PUBLIC_APP_URL` (used for Stripe success/cancel/portal redirects)
- Cron/scheduling: `CRON_SECRET`, `SCAN_EXECUTOR_BATCH_SIZE`
- Scan controls: `ALLOW_UNLIMITED_SCANS`, `ANON_SCAN_RATE_LIMIT_PER_HOUR`
- AI assistant: `OPENAI_API_KEY`
- Email (Resend): `RESEND_API_KEY`, `MONITORING_EMAIL_FROM`
- Analytics/Ads: `NEXT_PUBLIC_ANALYTICS_ENABLED`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
- Sentry (client): `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT` (server/edge DSN is currently hardcoded in `sentry.*.config.ts`)
- Build/runtime (Next/CI): `NODE_ENV`, `NEXT_RUNTIME`, `CI`

## Project conventions
- Route handlers: export `runtime = "nodejs"` and return `NextResponse.json(...)` (example: `app/api/scan/create/route.ts`).
- URL inputs: normalize/validate with `new URL()`, auto-add `https://`, and reject `localhost`/`127.0.0.1` (scan routes).
- Plan/feature gating: use `PLANS`, `canScanNow`, and `hasFeature` instead of ad-hoc checks (`lib/plans.ts`, `lib/planGuards.ts`, `lib/featureAccess.ts`).
- Component boundaries: `components/admin` is admin-only UI; don’t import it outside admin routes (see `README.md`).

## Scheduling, billing, observability
- Scheduled scans: `app/api/cron/scans/route.ts` is guarded by Vercel cron header (`x-vercel-cron: 1`) or `?secret=${CRON_SECRET}`. It queues due websites via `lib/cron/scanScheduler.ts` and executes up to `SCAN_EXECUTOR_BATCH_SIZE`.
- Anonymous scans: attach to the shared Clerk ID `public-anonymous` and rate-limit via `ANON_SCAN_RATE_LIMIT_PER_HOUR` (`app/api/scan/route.ts`).
- Stripe checkout: `app/api/stripe/checkout/route.ts` requires auth + a complete billing profile; writes `{ userId, planName }` into Stripe metadata.
- Stripe webhook: `app/api/stripe/webhook/route.ts` is idempotent via `StripeWebhookEvent` and updates `user.plan` via `services/billingService.ts`.
- Sentry: wiring is in `instrumentation.ts`; checkout wraps Stripe calls in a Sentry span.
- Security headers/CSP: configured in `next.config.ts`—update CSP if you add new external hosts.
- Generate Prisma client: `npx prisma generate` (also runs on postinstall).
