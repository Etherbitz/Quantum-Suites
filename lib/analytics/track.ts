/**
 * Analytics event payload.
 */
export interface AnalyticsEventPayload {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Determines if analytics should be enabled.
 */
function analyticsEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true"
  );
}

/**
 * Tracks analytics events safely.
 */
export function trackEvent(
  event: string,
  payload?: AnalyticsEventPayload
): void {
  if (!analyticsEnabled()) return;

  if (process.env.NODE_ENV === "development") {
    console.debug("[Analytics]", event, payload);
  }

  // Provider hooks (add later)
  // window.gtag?.("event", event, payload);
  // window.plausible?.(event, { props: payload });
  // window.posthog?.capture(event, payload);
}
