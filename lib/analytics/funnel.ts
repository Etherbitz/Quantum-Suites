/**
 * Funnel stage identifiers.
 */
export type FunnelStage =
  | "cta_click"
  | "scan_submit"
  | "pricing_plan_selected"
  | "account_created"
  | "subscription_started";

/**
 * Funnel stage metadata.
 */
export const FUNNEL_STAGES: {
  id: FunnelStage;
  label: string;
}[] = [
  { id: "cta_click", label: "CTA Clicked" },
  { id: "scan_submit", label: "Scan Submitted" },
  { id: "pricing_plan_selected", label: "Plan Selected" },
  { id: "account_created", label: "Account Created" },
  { id: "subscription_started", label: "Subscription Started" },
];
