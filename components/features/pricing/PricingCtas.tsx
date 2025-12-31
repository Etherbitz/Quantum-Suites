"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/gtag";

export function PricingFreeCta() {
  return (
    <Link
      href="/scan"
      className="block w-full rounded-xl bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/40 transition hover:shadow-xl hover:brightness-110"
      onClick={() =>
        trackEvent("pricing_cta_click", {
          plan: "free",
          location: "pricing_page_free",
        })
      }
    >
      Start free daily scans
    </Link>
  );
}

export function PricingFooterScanCta() {
  return (
    <a
      href="/scan"
      className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-[0_18px_55px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(15,23,42,0.6)] hover:brightness-110"
      onClick={() =>
        trackEvent("scan_cta_click", {
          location: "pricing_page_footer",
        })
      }
    >
      Start Free Scan
    </a>
  );
}
