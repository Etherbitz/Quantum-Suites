// Values are expressed in minutes so scheduling code can work
// with a single consistent unit ("intervalMinutes").
export const PLAN_SCAN_INTERVALS: Record<string, number | null> = {
  free: null,            // no automation
  starter: 7 * 24 * 60,  // every 7 days
  business: 24 * 60,     // every 24 hours (daily)
  agency: 24 * 60,       // every 24 hours (daily) for unlimited sites
};
