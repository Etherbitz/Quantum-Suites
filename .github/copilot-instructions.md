# Quantum Suites AI - Copilot Instructions

## Architecture Overview

This is a **Next.js 16 App Router** SaaS application for website compliance scanning with tiered subscription plans. Key integrations:
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database**: PostgreSQL via Prisma with `@prisma/adapter-pg` and pooling
- **Payments**: Stripe subscription webhooks
- **Styling**: Tailwind CSS 4

### Core Data Flow
1. Users authenticate via Clerk → auto-create User record via `getOrCreateUser(clerkId, email)`
2. Scan requests → API routes check plan limits → create Scan records
3. Stripe webhooks → update User.plan field → unlock features
4. Feature access controlled by plan configuration in [lib/plans.ts](../lib/plans.ts)

## Critical Developer Workflows

### Database Setup
```bash
# Generate Prisma client (runs automatically on npm install via postinstall)
npx prisma generate
# Quantum Suites AI - Copilot Instructions

## Architecture Overview
- Next.js 16 App Router SaaS for website compliance scanning.
- Auth via Clerk (`@clerk/nextjs`); DB: PostgreSQL via Prisma + `@prisma/adapter-pg` pooling; Payments: Stripe subscriptions; Styling: Tailwind CSS 4.
- Flow: Clerk auth → `getOrCreateUser(clerkId, email)` → scans gated by plan limits → Stripe webhooks update `user.plan` → features checked via plan config.

## Core Data Flow
1) Users authenticate → user record upserted.
2) Scan requests hit API → plan limits (sites, frequency) enforced → scan saved.
3) Stripe webhooks adjust `user.plan` on checkout/subscription events.
4) Feature gating uses plan config in [lib/plans.ts](../lib/plans.ts).

## Critical Developer Workflows
- Generate Prisma client: `npx prisma generate` (also runs on postinstall).
- Migrations: `npx prisma migrate dev --name <desc>` (local); `npx prisma migrate deploy` (prod).
- Run: `npm run dev` | `npm run build` | `npm run lint`.
- Required env: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_*`.

## Project Conventions
- Auth in API routes: always `await auth()`; allow anonymous scans with `userId ?? null`.
- Plan limits: use PLANS in [lib/plans.ts](../lib/plans.ts); feature flags via [lib/featureAccess.ts](../lib/featureAccess.ts); scan frequency via [lib/planGuards.ts](../lib/planGuards.ts).
- Prisma: import singleton `prisma` from [lib/db.ts](../lib/db.ts); upsert users on first auth.
- Components: client interactivity requires "use client"; icons via lucide-react; primary/secondary buttons in [components/PrimaryButton.tsx](../components/PrimaryButton.tsx) and [components/SecondaryButton.tsx](../components/SecondaryButton.tsx).
- API routes: export `runtime = "nodejs"`; return `NextResponse.json`.

## Scanning & Automation
- Scan engine: [lib/scanner/engine.ts](../lib/scanner/engine.ts) orchestrates HTML fetch, WCAG/GDPR/security checks, scoring.
- Accessibility checks: [lib/scanner/accessibility.ts](../lib/scanner/accessibility.ts) (WCAG 2.2 codes/versions).
- Compliance/security checks: [lib/scanner/compliance.ts](../lib/scanner/compliance.ts) (HTTPS, HSTS/CSP/XFO/nosniff, cookie consent, privacy/contact).
- Daily cron rescans paying tiers: [app/api/cron/daily/route.ts](../app/api/cron/daily/route.ts) guarded by `CRON_SECRET` header or `?secret=` query.

## Stripe & Clerk
- Upgrade CTA: [components/UpgradeButton.tsx](../components/UpgradeButton.tsx) → POST `/api/stripe/checkout` with `priceId`, `planName`.
- Webhooks: [app/api/stripe/webhook/route.ts](../app/api/stripe/webhook/route.ts) handles checkout/subscription create/update/delete → updates `user.plan`.
- App wrapped with Clerk: [app/layout.tsx](../app/layout.tsx); built-in `/sign-in`, `/sign-up` pages.

## Data & Schema
- Core schema: [prisma/schema.prisma](../prisma/schema.prisma) (User, Scan, Regulation, RegulationRule).
- Seed regulations/rules (WCAG, GDPR, baseline security): `npm run seed:regulations` (script: [scripts/seed-regulations.cjs](../scripts/seed-regulations.cjs)).

## Key Endpoints
- Scan create (plan-enforced): [app/api/scan/create/route.ts](../app/api/scan/create/route.ts).
- Anonymous scan: [app/api/scan/route.ts](../app/api/scan/route.ts).
- Cron daily rescans: [app/api/cron/daily/route.ts](../app/api/cron/daily/route.ts).

## Troubleshooting
- Webhooks: Stripe CLI logs + [app/api/stripe/webhook/route.ts](../app/api/stripe/webhook/route.ts).
- Prisma: ensure `DATABASE_URL` set; rerun `npx prisma generate` if types missing.
- Auth errors: confirm `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` present.
await prisma.user.upsert({
