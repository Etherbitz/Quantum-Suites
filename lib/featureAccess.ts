import { PLANS } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

/**
 * Union of all possible plan configuration shapes.
 * This allows safe access to shared feature flags.
 */
export type PlanConfig = (typeof PLANS)[Plan];

/**
 * Checks whether a plan has a specific feature enabled.
 *
 * Example:
 *   hasFeature(user.plan, "detailedReports")
 *
 * Accepts loose plan values and safely falls back to false
 * for unknown or null/undefined plans.
 */
export function hasFeature(
  plan: Plan | string | null | undefined,
  feature: keyof PlanConfig
): boolean {
  const config = PLANS[plan as Plan];
  return Boolean(config?.[feature]);
}
