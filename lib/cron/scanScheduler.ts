import { prisma } from "@/lib/db";
import { PLAN_SCAN_INTERVALS } from "@/lib/scanner/scanIntervals";
import { computeNextScanAt } from "@/lib/scanner/nextScan";
import { queueScanJob } from "@/services/scanService";

interface ScanSchedulerResult {
  triggered: number;
}

/**
 * Finds websites that are due for scanning based on
 * their nextScanAt and the owning user&apos;s plan, queues
 * scan jobs for them, and bumps their nextScanAt.
 */
export async function runDueWebsiteScans(now = new Date()): Promise<ScanSchedulerResult> {
  const websites = await prisma.website.findMany({
    where: {
      nextScanAt: {
        lte: now,
      },
      user: {
        plan: {
          in: ["starter", "business", "agency"],
        },
      },
    },
    include: {
      user: true,
    },
  });

  let triggered = 0;

  for (const website of websites) {
    const rawPlan = typeof website.user.plan === "string" ? website.user.plan.toLowerCase() : "free";
    const interval = PLAN_SCAN_INTERVALS[rawPlan as keyof typeof PLAN_SCAN_INTERVALS];

    if (!interval) continue;

    await queueScanJob({
      userId: website.userId,
      websiteId: website.id,
      type: "scheduled",
      autoStart: true,
    });

    await prisma.website.update({
      where: { id: website.id },
      data: {
        nextScanAt: computeNextScanAt(now, interval),
      },
    });

    triggered++;
  }

  return { triggered };
}
