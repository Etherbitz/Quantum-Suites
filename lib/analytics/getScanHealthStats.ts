import { prisma } from "@/lib/db";

export interface ScanHealthStats {
  queued: number;
  queuedScheduled: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
  errorRate: number | null;
  oldestQueuedMinutes: number | null;
  oldestQueuedScheduledMinutes: number | null;
  byPlan: {
    free: ScanHealthStatsByPlan;
    starter: ScanHealthStatsByPlan;
    business: ScanHealthStatsByPlan;
    agency: ScanHealthStatsByPlan;
  };
}

export interface ScanHealthStatsByPlan {
  completed: number;
  failed: number;
}

export type ScanHealthWindow = "24h" | "7d" | "30d";

/**
 * Returns basic scan health metrics for the admin analytics dashboard.
 *
 * - Queue depth (queued + running)
 * - Throughput and failures over the configured window
 * - Age of the oldest queued job
 */
export async function getScanHealthStats(
  window: ScanHealthWindow = "24h"
): Promise<ScanHealthStats> {
  const now = new Date();

  const since =
    window === "7d"
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : window === "30d"
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    queued,
    queuedScheduled,
    running,
    completed,
    failed,
    oldestQueued,
    oldestQueuedScheduled,
    byPlanRows,
  ] =
    await Promise.all([
      prisma.scanJob.count({
        where: { status: "QUEUED" },
      }),
      prisma.scanJob.count({
        where: { status: "QUEUED", type: "scheduled" },
      }),
      prisma.scanJob.count({
        where: { status: "RUNNING" },
      }),
      prisma.scanJob.count({
        where: {
          status: "COMPLETED",
          finishedAt: {
            gte: since,
          },
        },
      }),
      prisma.scanJob.count({
        where: {
          status: "FAILED",
          finishedAt: {
            gte: since,
          },
        },
      }),
      prisma.scanJob.findFirst({
        where: {
          status: "QUEUED",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.scanJob.findFirst({
        where: {
          status: "QUEUED",
          type: "scheduled",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.scanJob.groupBy({
        by: ["status", "userId"],
        where: {
          finishedAt: {
            gte: since,
          },
          user: {
            // Ignore anonymous scans for per-plan breakdown
            clerkId: { not: "public-anonymous" },
          },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

  const total = completed + failed;
  const errorRate =
    total > 0 ? Math.round((failed / total) * 100) : null;

  const oldestQueuedMinutes = oldestQueued
    ? Math.max(
        0,
        Math.round(
          (now.getTime() - oldestQueued.createdAt.getTime()) /
            (60 * 1000)
        )
      )
    : null;

  const oldestQueuedScheduledMinutes = oldestQueuedScheduled
    ? Math.max(
        0,
        Math.round(
          (now.getTime() - oldestQueuedScheduled.createdAt.getTime()) /
            (60 * 1000)
        )
      )
    : null;

  // Initialize per-plan buckets
  const byPlanBase: ScanHealthStatsByPlan = {
    completed: 0,
    failed: 0,
  };

  const byPlan: ScanHealthStats["byPlan"] = {
    free: { ...byPlanBase },
    starter: { ...byPlanBase },
    business: { ...byPlanBase },
    agency: { ...byPlanBase },
  };

  if (byPlanRows.length > 0) {
    const userPlans = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(new Set(byPlanRows.map((row) => row.userId))).filter(
            Boolean
          ) as string[],
        },
      },
      select: {
        id: true,
        plan: true,
      },
    });

    const planMap = new Map<string, string>();
    for (const user of userPlans) {
      planMap.set(user.id, (user.plan || "free").toLowerCase());
    }

    for (const row of byPlanRows) {
      if (!row.userId) continue;
      const rawPlan = planMap.get(row.userId) || "free";
      const planKey =
        rawPlan === "starter" || rawPlan === "business" || rawPlan === "agency"
          ? (rawPlan as "starter" | "business" | "agency")
          : "free";

      if (row.status === "COMPLETED") {
        byPlan[planKey].completed += row._count._all;
      } else if (row.status === "FAILED") {
        byPlan[planKey].failed += row._count._all;
      }
    }
  }

  return {
    queued,
    queuedScheduled,
    running,
    completed,
    failed,
    total,
    errorRate,
    oldestQueuedMinutes,
    oldestQueuedScheduledMinutes,
    byPlan,
  };
}
