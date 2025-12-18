import { FunnelStage } from "./funnel";

/**
 * Funnel statistics response.
 * Replace implementation with DB or provider later.
 */
export interface FunnelStats {
  stage: FunnelStage;
  count: number;
}

/**
 * Returns funnel counts.
 * Currently mocked.
 */
export async function getFunnelStats(): Promise<FunnelStats[]> {
  // MOCK DATA — replace later
  return [
    { stage: "cta_click", count: 1240 },
    { stage: "scan_submit", count: 610 },
    { stage: "pricing_plan_selected", count: 220 },
    { stage: "account_created", count: 90 },
    { stage: "subscription_started", count: 34 },
  ];
}
