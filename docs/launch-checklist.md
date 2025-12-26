# Quantum Suites AI – Launch Checklist

This document tracks remaining build work and a production launch checklist.

---

## 1. Build / Product TODOs

These are code or feature tasks that are either stubbed, mocked, or clearly marked as "coming soon".

### Notifications & Alerts

- [x] Ensure significant score-drop alerts are generated and stored when trends worsen.
  - Implemented server-side in `app/dashboard/page.tsx` using `evaluateComplianceDropAlert`, `PLAN_ALERT_CONFIG`, and `prisma.complianceAlert`.
  - `components/dashboard/ComplianceTrendChart.tsx` now only visualizes trends (no extra alert side-effects).
- [x] Implement real **Weekly summary** emails, or hide the setting until ready.
  - Decision for v1: hide the weekly summary setting entirely (no visible "Coming soon" copy).
  - Location: `app/dashboard/settings/page.tsx` (Notifications section).

### Admin Analytics Data

- [x] Replace mocked funnel stats with real data sources.
  - Location: `lib/analytics/getFunnelStats.ts` now derives live counts from Prisma (users, websites, and scan jobs) and excludes admin and anonymous records.
  - Used by: `app/dashboard/analytics/page.tsx` (admin-only analytics dashboard).
  - Future: optionally refine stage definitions or plug into a dedicated tracking table.

### Debug / Internal Endpoints

- [x] Remove or lock down Prisma debug endpoint before production.
  - Location: `app/api/_debug/prisma/route.ts` (Prisma connectivity sanity check).
  - Implemented: returns a 404-style JSON response when `NODE_ENV === "production"`; full debug info only in non-production.
- [x] Audit other internal APIs (`/api/account`, `/api/account/history`, `/api/schedule`, `/api/scan/attach`).
  - All are now Clerk-authenticated and scoped to the current user.
  - `/api/scan/attach` only attaches anonymous scans with no existing owner and uses the internal User.id.

### Alerts & Thresholds

- [ ] Verify the alert-threshold flow end-to-end.
  - API: `app/api/settings/alert-threshold/route.ts`.
  - UI: wherever alert thresholds are set in dashboard settings.
- [ ] Confirm alerts are generated and visible based on threshold and score deltas.
  - APIs: `app/api/alerts/route.ts`, `app/api/alerts/[id]/acknowledge/route.ts`.
  - UI: any alerts surfaces in the dashboard (e.g., recent alerts, banners, or notifications).

### CRON Scheduling & Monitoring

- [ ] Confirm cron-based scanning is the single source of truth for automated rescans.
  - Endpoint: `app/api/cron/scans/route.ts`.
  - Logic: uses `PLAN_SCAN_INTERVALS` and `computeNextScanAt`.
- [x] Align Starter plan behaviour between manual logic and cron intervals.
  - Manual: `app/api/scan/create/route.ts` sets `nextScanAt` for Starter as +7 days.
  - Config: `lib/scanner/scanIntervals.ts` defines Starter as 7 days; `app/api/cron/scans/route.ts` uses the same intervals.

### Stripe Plans vs App Plans

- [x] Double-check Stripe price IDs vs `PLANS` config.
  - Config: `lib/plans.ts` (Starter, Business, Agency definitions) now aligned with UI.
  - UI: home pricing section `app/page.tsx`, full pricing page `app/pricing/page.tsx`.
  - Stripe-powered button: `components/common/UpgradeButton.tsx`.
  - Remaining: set the correct live price IDs in env (`NEXT_PUBLIC_STRIPE_PRICE_*`).
- [x] Decide on Agency checkout behaviour for v1.
  - Implemented as self-serve via Stripe.
  - `PLANS.agency.stripePriceId` uses `NEXT_PUBLIC_STRIPE_PRICE_AGENCY`.
  - Agency CTAs on the home and pricing pages now use `UpgradeButton` instead of a plain sign-up link.

### Minor Polish / Consistency

- [ ] Clean up Tailwind lint warnings (non-blocking but nice to have).
  - Examples: `h-[360px]` -> `h-90` in `app/page.tsx`, `gap-[2px]` and `rounded-[0.5rem]` in `components/common/SiteLogo.tsx`.
- [x] Decide whether to keep or hide any "Coming soon" labels at GA.
  - Decision: hide "Weekly summary" for now; there are no remaining "Coming soon" labels in the UI.

---

## 2. Live Launch Checklist

This section covers environment variables, infrastructure, and critical flow QA before going live.

### Database & Prisma

- [ ] Set `DATABASE_URL` to the production Postgres instance.
- [ ] Run migrations in production: `npx prisma migrate deploy`.
- [ ] Seed regulations and rules once in prod:
  - Command: `node scripts/seed-regulations.cjs`.
  - Script: `scripts/seed-regulations.cjs` (WCAG, GDPR, baseline security rules).

### Clerk (Authentication)

- [ ] Configure a production Clerk instance with the correct domain(s).
- [ ] Set auth env variables in production:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] QA auth flows:
  - Sign-in and sign-up pages (`/sign-in`, `/sign-up`).
  - Sign-up completion + onboarding: `app/sign-up/complete/page.tsx` and `components/OnboardingFlow.tsx`.
  - Verify that `getOrCreateUser` is invoked and `user.plan` defaults to `free`.

### Stripe (Subscriptions & Billing)

- [ ] Create Stripe products/prices for Starter and Business; copy live price IDs:
  - `NEXT_PUBLIC_STRIPE_PRICE_STARTER`
  - `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`
- [ ] Set Stripe environment variables in production:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Configure Stripe webhook to POST to `/api/stripe/webhook`.
- [ ] QA billing flows (first in test mode, then with live keys):
  - Upgrade from Free → Starter/Business via `UpgradeButton`.
  - Verify `user.plan` updates correctly on checkout/session completed events.
  - Test subscription change and cancellation paths:
    - Active subscription → plan name set from metadata.
    - Cancellation → plan downgraded to `free`.

### AI Assistant

- [ ] Set AI/LLM-related environment variables for `/api/ai/assistant` (e.g. OpenAI key, model name).
- [ ] QA AI assistant behaviour in a real scan results view:
  - Path: `components/results/AiAssistant.tsx` (section on scan results page).
  - Business plan: confirm 5 requests/month hard cap behaviour (429 + upgrade messaging).
  - Agency plan: confirm 500 replies/month hard cap behaviour (429 + "contact us for pricing" messaging).

### Scanning & Cron

- [ ] Manual scan QA:
  - Use `/scan` page (`app/scan/page.tsx`) while signed in.
  - Confirm a `ScanJob` record is created and flows through QUEUED → RUNNING → COMPLETED.
  - Verify results and score render correctly:
    - History list: `components/dashboard/ScanHistory.tsx`.
    - Score widgets: dashboard components in `components/dashboard`.
- [ ] Anonymous scan QA:
  - Hitting `POST /api/scan` without auth should create an anonymous scan job and return a job ID.
- [ ] Configure production cron to call `/api/cron/scans?secret=CRON_SECRET`.
  - Set `CRON_SECRET` in production env.
  - On your platform (e.g. Vercel Cron), schedule the job at your desired frequency.
  - Verify scheduled scans are created and `nextScanAt` is updated for eligible websites.

### Security & Hardening

- [x] Remove or fully restrict debug endpoints:
  - `app/api/_debug/prisma/route.ts` now returns a 404-style response in production; full debug info only in non-production.
- [ ] Verify error responses dont leak stack traces or sensitive config in JSON.
- [ ] Confirm any public-facing APIs (reports export, alerts, etc.) enforce auth/authorization.

### UX & Content QA

- [ ] Mobile and desktop QA for key pages:
  - Home / landing: `app/page.tsx` (hero, risk section, how-it-works, monitoring, pricing, testimonials, FAQ, final CTA).
  - Scan page: `app/scan/page.tsx`.
  - Dashboard: `app/dashboard/page.tsx` and subroutes (analytics, reports, settings) for admin users.
- [ ] Verify pricing copy matches plan limits and features:
  - Config: `lib/plans.ts`.
  - UI: home pricing section (`PricingSection` in `app/page.tsx`) and full pricing page (`app/pricing/page.tsx`).
- [ ] Review and finalize legal pages:
  - Privacy: `app/privacy/page.tsx`.
  - Terms: `app/terms/page.tsx`.

### Deployment / Vercel

- [ ] Add all required environment variables to the Vercel project (or your hosting platform):
  - `DATABASE_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_*`
  - AI / LLM secrets for `/api/ai/assistant`
  - `CRON_SECRET`
- [ ] Run local checks before first production deploy:
  - `npm run build`
  - `npm run lint`
- [ ] Deploy to production and run a full smoke test on the live domain:
  - Auth flows, scan creation, dashboard rendering.
  - Stripe upgrade/downgrade flows.
  - AI assistant on a completed scan.
  - Cron-triggered scans (once cron is configured).
