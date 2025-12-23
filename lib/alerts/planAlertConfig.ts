/**
 * Plan-based alert configuration
 * Single source of truth for alert behavior
 */

export type AlertPlan =
  | "free"
  | "starter"
  | "business"
  | "agency";

export interface PlanAlertConfig {
  enabled: boolean;
  mode: "none" | "scheduled_only" | "realtime";
  dropThreshold: number;
  cooldownHours: number;
}

export const PLAN_ALERT_CONFIG: Record<
  AlertPlan,
  PlanAlertConfig
> = {
  free: {
    enabled: false,
    mode: "none",
    dropThreshold: 0,
    cooldownHours: 0,
  },

  starter: {
    enabled: false,
    mode: "scheduled_only",
    dropThreshold: 10,
    cooldownHours: 48,
  },

  business: {
    enabled: true,
    mode: "realtime",
    dropThreshold: 5,
    cooldownHours: 12,
  },

  agency: {
    enabled: true,
    mode: "realtime",
    dropThreshold: 1,
    cooldownHours: 2,
  }
}