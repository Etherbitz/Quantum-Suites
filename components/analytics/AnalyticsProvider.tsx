"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics/gtag";

/**
 * AnalyticsProvider
 *
 * Listens for route changes in the App Router and
 * sends GA4 page_view events for every navigation.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // Avoid running during server prerender / 404 export issues
    if (typeof window === "undefined") return;

    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}
