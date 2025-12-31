import { PLANS } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

export function canScanNow(
  plan: Plan,
  lastScanAt: Date | null
): boolean {
  const frequency = PLANS[plan].scanFrequency;

  if (frequency === "once") {
    return lastScanAt === null;
  }

  if (frequency === "daily") {
    if (!lastScanAt) return true;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return lastScanAt.getTime() < dayAgo;
  }

  if (frequency === "weekly") {
    if (!lastScanAt) return true;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return lastScanAt.getTime() < weekAgo;
  }

  // continuous
  return true;
}
