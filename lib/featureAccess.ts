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
 */
export function hasFeature(
  plan: Plan,
  feature: keyof PlanConfig
): boolean {
  return Boolean(PLANS[plan][feature]);
}
