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

/**
 * Returns funnel counts.
 * Currently mocked.
 */
export async function getFunnelStats(): Promise<FunnelStats[]> {
  const [
    scanJobCount,
    websiteCount,
    totalUsers,
    paidUsers,
  ] = await Promise.all([
    // Only include scan jobs from non-admin users
    prisma.scanJob.count({
      where: {
        user: {
          role: "USER",
          clerkId: { not: "public-anonymous" },
        },
      },
    }),
    // Only include websites owned by non-admin users
    prisma.website.count({
      where: {
        user: {
          role: "USER",
          clerkId: { not: "public-anonymous" },
        },
      },
    }),
    // Only real, non-admin users
    prisma.user.count({
      where: {
        role: "USER",
        clerkId: { not: "public-anonymous" },
      },
    }),
    // Paying, non-admin users
    prisma.user.count({
      where: {
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
