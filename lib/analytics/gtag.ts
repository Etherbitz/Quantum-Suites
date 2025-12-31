export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// Record a GA4 page_view when the route changes
export function trackPageView(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

// Generic event helper for important user actions
export function trackEvent(
  action: string,
  params?: Record<string, any>
) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", action, params ?? {});
}

declare global {
  interface Window {
    // Minimal gtag typing for our usage
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrAction: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}
