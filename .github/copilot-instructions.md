# Quantum Suites AI — Copilot Instructions

## Big picture
- Next.js 16 App Router SaaS for website compliance scanning (Tailwind CSS 4).
- Auth: Clerk (`@clerk/nextjs`). When you have a Clerk user + email, prefer `getOrCreateUser(clerkId, email)` (special-cases `admin@quantumsuites-ai.com` → `role=ADMIN`, `plan=agency`). See `lib/getOrCreateUser.ts`.
- DB: PostgreSQL via Prisma 7 + PG adapter/pool (`lib/db.ts`). `User.plan` is stored as a plain string; normalize/validate against `Plan` keys from `lib/plans.ts`.

## Source of truth (data model)
- Core models are in `prisma/schema.prisma`: `User`, `Website`, `ScanJob` (single scan record), `ComplianceAlert`, `AiUsage`, `StripeWebhookEvent`.

## Scans (central flow)
- Most code should go through `services/scanService.ts`:
	- `createScan()` creates/ensures a `Website`, enforces plan limits, and queues a `ScanJob`.
	- `queueScanJob()` is the canonical way to create `ScanJob` rows.
	- `executeScan()` runs the scan, writes results back to the job, and may trigger alerts.
- Scan engine: `lib/scanner/engine.ts` orchestrates fetch + accessibility + compliance checks and computes score/risk.

## API route conventions
- Route handlers generally export `runtime = "nodejs"` and return `NextResponse.json(...)`.
- URL inputs: routes normalize with `new URL()` and auto-prepend `https://`; reject `localhost`/`127.0.0.1` (see `app/api/scan/create/route.ts`, `app/api/scan/route.ts`).
- Some scan routes run synchronously and set `maxDuration = 60` (scan/create and anonymous scan).
- Authenticated routes should prefer `getOrCreateUser()` when an email is available (example: `app/api/scan/create/route.ts`).
- Some routes intentionally use direct Prisma `upsert`:
	- Signup init: `app/api/auth/init/route.ts` creates/updates the `User` after onboarding completion.
	- Anonymous scans: `app/api/scan/route.ts` upserts the shared `public-anonymous` user + website records.

## Scheduling / cron
- `app/api/cron/scans/route.ts` is authorized by Vercel cron header `x-vercel-cron: 1` OR `?secret=${CRON_SECRET}`.
- Due websites are queued via `lib/cron/scanScheduler.ts` (uses `Website.nextScanAt` + `PLAN_SCAN_INTERVALS`), then `SCAN_EXECUTOR_BATCH_SIZE` scheduled jobs are executed.

## Billing (Stripe)
- Checkout: `app/api/stripe/checkout/route.ts` requires auth + a complete billing profile before creating a subscription.
- Stripe metadata MUST include `{ userId, planName }` on both the Checkout session and subscription (`subscription_data.metadata`).
- Webhook: `app/api/stripe/webhook/route.ts` is idempotent via `StripeWebhookEvent` and updates `user.plan` via `services/billingService.ts`.

## Feature gating & admin
- Plan flags live in `lib/plans.ts`. Use `canScanNow()` for frequency gating and `hasFeature(plan, "feature")` for feature flags.
- Admin-only pages should call `requireAdmin()` from `lib/adminGuard.ts`.
- Component boundary: don’t import `components/admin` outside admin routes (see `README.md`).

## Dev workflows
- `npm run dev` | `npm run build` | `npm run lint`.
- Prisma client is generated on install (`postinstall`: `prisma generate`). DB notes: `DATABASE_SETUP.md`.
- Seed regulations: `npm run seed:regulations` (`scripts/seed-regulations.cjs`).

## Key environment variables
- `DATABASE_URL`
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_STARTER`, `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`, `NEXT_PUBLIC_STRIPE_PRICE_AGENCY`, `NEXT_PUBLIC_APP_URL`
- Cron: `CRON_SECRET`, `SCAN_EXECUTOR_BATCH_SIZE`
- Scans: `ALLOW_UNLIMITED_SCANS`, `ANON_SCAN_RATE_LIMIT_PER_HOUR`
- AI: `OPENAI_API_KEY`

## Infra / observability gotchas
- Sentry runtime wiring is in `instrumentation.ts` (loads server vs edge config based on `NEXT_RUNTIME`).
- Security headers + CSP are in `next.config.ts`; update CSP if adding new external hosts.
