import type { Plan } from "@/lib/plans";

const ORDER: Record<Plan, number> = {
  free: 0,
  starter: 1,
  business: 2,
  agency: 3,
};

export type PlanRelation = "current" | "upgrade" | "downgrade";

export function getPlanRelation(
  target: Plan,
  currentPlan: string | null | undefined
): PlanRelation {
  if (!currentPlan) return "upgrade";

  const normalized = currentPlan.toLowerCase() as Plan;

  if (!(normalized in ORDER)) return "upgrade";

  if (ORDER[target] === ORDER[normalized]) return "current";

  return ORDER[target] > ORDER[normalized] ? "upgrade" : "downgrade";
}
