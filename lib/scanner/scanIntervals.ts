export const PLAN_SCAN_INTERVALS: Record<string, number | null> = {
  free: null,            // no automation
  starter: 7 * 24 * 60,  // 7 days (minutes)
  business: 24 * 60,     // 24h
  agency: 24 * 60,       // 24h for unlimited sites
};
