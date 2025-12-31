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
    scanJobCount,
    websiteCount,
    totalUsers,
    paidUsers,
  ] = await Promise.all([
    // Only include scan jobs from non-admin users
    prisma.scanJob.count({
      where: {
        createdAt: createdFilter,
        user: {
          role: "USER",
          clerkId: { not: "public-anonymous" },
        },
      },
    }),
    // Only include websites owned by non-admin users
    prisma.website.count({
      where: {
        createdAt: createdFilter,
        user: {
          role: "USER",
          clerkId: { not: "public-anonymous" },
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
    { stage: "cta_click", count: scanJobCount },
    { stage: "scan_submit", count: websiteCount },
    { stage: "pricing_plan_selected", count: totalUsers },
    { stage: "account_created", count: totalUsers },
    { stage: "subscription_started", count: paidUsers },
  ];

  return stats;
}
