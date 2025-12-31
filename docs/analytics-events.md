# GA4 Event Mapping

This document summarizes the custom GA4 events implemented in the Quantum Suites AI marketing and product flows, plus recommended conversion settings.

## Overview

Page views are tracked automatically via the AnalyticsProvider and `trackPageView`. The events below are sent via `trackEvent` from `lib/analytics/gtag.ts`.

---

## Event Reference

### 1. `scan_start`
- **When it fires**
  - User submits the scan form on `/scan`.
- **Source file(s)**
  - `app/scan/page.tsx`
- **Key parameters**
  - `url` – normalized URL entered by the user.
  - `source` – e.g. `"scan_page"`.
- **Use in GA4**
  - Funnel step before `scan_complete`.

### 2. `scan_complete`
- **When it fires**
  - A scan finishes successfully, either via anonymous direct flow or via polling.
- **Source file(s)**
  - `app/scan/page.tsx` (anonymous direct path).
  - `components/scan/useScanJobPolling.ts` (polled completion).
- **Key parameters**
  - `url` (for anonymous direct scans).
  - `source` – `"scan_page_anonymous_direct"` or `"scan_polling"`.
  - `scanId` – internal scan identifier.
  - `scanJobId` – job identifier (polling path).
- **Recommended GA4 conversion**
  - **Yes** – primary product value moment. Create a conversion for `scan_complete`.

### 3. `scan_error`
- **When it fires**
  - Scan creation fails (validation, limits, API issues).
  - Polling reports a failed status or hits a network/other error.
- **Source file(s)**
  - `app/scan/page.tsx`.
  - `components/scan/useScanJobPolling.ts`.
- **Key parameters**
  - `url` – when available.
  - `source` – e.g. `"scan_page_primary"`, `"scan_page_catch"`, `"scan_polling"`, `"scan_polling_catch"`.
  - `error` – error code or message.
  - `reason` – additional context, when available.
  - `status` – HTTP status for API failures.
- **Use in GA4**
  - Debug and reliability dashboards; segment funnels by users hitting errors.

### 4. `scan_cta_click`
- **When it fires**
  - User clicks a primary "Scan" CTA that links to `/scan`.
- **Source file(s)**
  - `app/page.tsx` (home hero primary button, hero dashboard card, final CTA section).
  - `app/pricing/page.tsx` (footer "Start Free Scan" CTA).
- **Key parameters**
  - `location` – e.g. `"home_hero_primary"`, `"home_hero_dashboard_card"`, `"home_final_cta"`, `"pricing_page_footer"`.
- **Recommended GA4 conversion**
  - Optional – can be a micro-conversion for intent. Consider marking as conversion if you want to measure scan intent separately from completions.

### 5. `pricing_cta_click`
- **When it fires**
  - User clicks pricing-related CTAs:
    - Upgrade buttons on pricing cards.
    - Free-plan "Start free daily scans" buttons.
    - Pricing links from the scan page ("Unlock Full Reports", "View Plans").
- **Source file(s)**
  - `components/common/UpgradeButton.tsx`.
  - `app/page.tsx` (home pricing free card, hero secondary CTA).
  - `app/pricing/page.tsx` (free card CTA).
  - `app/scan/page.tsx` ("Unlock Full Reports" CTA and paid feature card links).
- **Key parameters**
  - `plan` – one of: `"free"`, `"starter"`, `"business"`, `"agency"` (when applicable).
  - `location` – e.g. `"pricing_card"`, `"home_hero_secondary"`, `"home_pricing_free"`, `"pricing_page_free"`, `"scan_page_unlock_full_reports"`, `"scan_page_featurecard"`.
  - `feature` – feature card title (for scan page feature cards).
- **Recommended GA4 conversions**
  - **Yes, for upgrade CTAs** – create a conversion for `pricing_cta_click` with additional GA4 audiences / segments:
    - Filter where `plan` in `("starter", "business", "agency")` and/or `location = "pricing_card"`.
  - Optionally keep free-plan and non-upgrade clicks as non-conversion events for intent analysis.

### 6. `signup_cta_click`
- **When it fires**
  - User clicks sign-in or sign-up CTAs from the header.
- **Source file(s)**
  - `components/common/HeaderAuth.tsx`.
- **Key parameters**
  - `location` – `"header_sign_in"` or `"header_start_free"`.
- **Recommended GA4 conversions**
  - **Yes** – treat `signup_cta_click` as a top-of-funnel conversion (start of signup). 
  - Additionally, you may define another event at actual account creation (e.g. via Clerk webhooks) and mark that as a "signup_completed" conversion.

### 7. `billing_portal_click`
- **When it fires**
  - User opens the Stripe billing portal from manage-plan actions.
- **Source file(s)**
  - `components/common/ManagePlanButton.tsx`.
- **Key parameters**
  - `source` – `"manage_plan_button"`.
  - `label` – label text of the button (e.g. "Downgrade to Starter").
- **Use in GA4**
  - Helpful for retention/expansion analysis and understanding how often existing customers manage subscriptions.
  - Usually **not** a primary conversion, but can be tracked as a secondary conversion if subscription changes are a key KPI.

---

## Suggested GA4 Conversion Setup

1. In the GA4 UI, go to **Configure → Events** and confirm these events are being received.
2. Then go to **Configure → Conversions** and click **New conversion event** for:
   - `scan_complete` (primary product value event).
   - `signup_cta_click` (or a future `signup_completed` event when implemented).
   - `pricing_cta_click` (optionally treating upgrade-focused clicks as your main monetization conversion).
3. Use GA4 Audiences and Explorations to segment `pricing_cta_click` by `plan` and `location` so you can see which plans and CTAs convert best.

---

## Quick QA Checklist

Use this to validate events end-to-end after deploy:

1. **Enable debug mode (optional but recommended)**
  - Install the GA Debug Chrome extension *or* add `?debug_mode=1` to your site URL.
  - Confirm events appear in **Admin → DebugView** in GA4.

2. **Test page views**
  - Navigate between key routes: `/`, `/scan`, `/pricing`, `/contact`.
  - In **Reports → Real-time**, confirm page views with the correct `page_path`.

3. **Test scan funnel**
  - From `/`, click a "Scan My Website" CTA.
  - On `/scan`, start a scan and wait for completion.
  - In DebugView / Real-time, verify this sequence:
    - `scan_cta_click` → `scan_start` → `scan_complete` (or `scan_error` if something fails).

4. **Test pricing CTAs**
  - On `/pricing` and the home pricing section (`/#pricing`), click:
    - Free plan "Start free daily scans".
    - Upgrade buttons (Starter/Business/Agency).
  - Verify `pricing_cta_click` fires with expected `plan` and `location` parameters.

5. **Test signup CTAs**
  - From the header, click **Sign in** and **Start free**.
  - Confirm `signup_cta_click` appears with the right `location`.

6. **Test billing portal access (signed-in test user)**
  - From dashboard/settings or any surface that shows "Manage plan", click to open the billing portal.
  - Verify `billing_portal_click` fires with `source = "manage_plan_button"`.

7. **Confirm conversions**
  - Once events are flowing, check **Configure → Conversions** after a few hours.
  - Ensure `scan_complete`, `signup_cta_click`, and `pricing_cta_click` are recording conversion counts.

---

## Suggested GA4 Audiences

You can define the audiences below in **Configure → Audiences** using `event_name` and relevant parameters.

### 1. High-intent scanners who didn’t upgrade

- **Logic**
  - Include users with `event_name = "scan_complete"` in the last 30 days.
  - AND exclude users with `event_name = "pricing_cta_click"` where `plan` in `("starter", "business", "agency")` in the same period.
- **Use cases**
  - Remarketing campaigns.
  - Email nudges or in-app prompts to upgrade from free to paid.

### 2. Pricing explorers who never ran a scan

- **Logic**
  - Include users with `event_name = "pricing_cta_click"` (any `plan`) in the last 30 days.
  - AND exclude users with any `scan_complete` event.
- **Use cases**
  - Educate the value of running a first scan.
  - Guide users from pricing exploration to product usage.

### 3. Upgrade-qualified scanners

- **Logic**
  - Include users with at least **2** `scan_complete` events in the last 14 days.
  - AND at least one `pricing_cta_click` where `plan = "free"` (clicked free-tier CTAs).
- **Use cases**
  - Targeted upsell flows from free → Starter/Business.
  - Sales or CS outreach for high-usage free users.

### 4. Hot upgrade prospects

- **Logic**
  - Include users with `event_name = "pricing_cta_click"` where `plan in ("starter", "business", "agency")` in the last 7 days.
  - Optionally require at least one `scan_complete` to ensure they’ve seen product value.
- **Use cases**
  - "Finish your upgrade" email sequences.
  - High-intent retargeting audiences.

### 5. Signup-starters who didn’t finish

- **Logic**
  - Include users with `event_name = "signup_cta_click"` in the last 14 days.
  - Exclude users with your eventual `signup_completed` (or Clerk-based signup) event.
- **Use cases**
  - Recover abandoned signups.
  - Diagnose and fix signup friction.

### 6. At-risk existing customers

- **Logic**
  - Include users with `event_name = "billing_portal_click"` in the last 30 days.
  - AND **zero** `scan_complete` events in the last 14 days.
- **Use cases**
  - Early-warning retention cohort.
  - CS outreach to understand why they’re managing billing without seeing value.

