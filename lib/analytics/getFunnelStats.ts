import { FunnelStage } from "./funnel";
import { prisma } from "@/lib/db";

/**
 * Funnel statistics response.
 * Replace implementation with DB or provider later.
 */
export interface FunnelStats {
  stage: FunnelStage;
  count: number;
}

export type FunnelWindow = "all" | "7d" | "30d";

/**
 * Returns funnel counts.
 *
 * By default returns all-time numbers; pass a window ("7d" or "30d")
 * to constrain counts to a recent period.
 */
export async function getFunnelStats(
  window: FunnelWindow = "all"
): Promise<FunnelStats[]> {
  const now = new Date();
  const since =
    window === "7d"
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : window === "30d"
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : null;

  const createdFilter = since
    ? {
        gte: since,
      }
    : undefined;

  const [
    scanStarts,
    websitesTouched,
    totalUsers,
    paidUsers,
  ] = await Promise.all([
    // Top-of-funnel: include anonymous activity (public-anonymous is role=USER)
    // but exclude admin activity.
    prisma.scanJob.count({
      where: {
        createdAt: createdFilter,
        user: {
          role: "USER",
        },
      },
    }),
    // A proxy for "scan submitted" / "website entered".
    // Includes anonymous websites so you see activity even before signups.
    prisma.website.count({
      where: {
        createdAt: createdFilter,
        user: {
          role: "USER",
        },
      },
    }),
    // Only real, non-admin users
    prisma.user.count({
      where: {
        createdAt: createdFilter,
        role: "USER",
        clerkId: { not: "public-anonymous" },
      },
    }),
    // Paying, non-admin users
    prisma.user.count({
      where: {
        createdAt: createdFilter,
        role: "USER",
        clerkId: { not: "public-anonymous" },
        plan: { not: "free" },
      },
    }),
  ]);

  const stats: FunnelStats[] = [
    { stage: "cta_click", count: scanStarts },
    { stage: "scan_submit", count: websitesTouched },
    { stage: "pricing_plan_selected", count: totalUsers },
    { stage: "account_created", count: totalUsers },
    { stage: "subscription_started", count: paidUsers },
  ];

  return stats;
}
