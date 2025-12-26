import { prisma } from "@/lib/db";
import { runScanJob } from "@/lib/scanner/runScanJob";
import type { ScanJob, ScanStatus } from "@prisma/client";

export type ScanJobType = "manual" | "scheduled" | "anonymous" | string;

interface QueueScanJobParams {
  userId: string | null;
  websiteId: string;
  type: ScanJobType;
  status?: ScanStatus;
  /**
   * Fire-and-forget execution of the scan job.
   * Routes usually want this to be true so HTTP
   * responses are not blocked by the scan.
   */
  autoStart?: boolean;
}

/**
 * Central place to create and kick off scan jobs.
 *
 * API routes, cron jobs, and future workers should
 * call this instead of touching ScanJob directly.
 */
export async function queueScanJob({
  userId,
  websiteId,
  type,
  status = "QUEUED",
  autoStart = true,
}: QueueScanJobParams): Promise<ScanJob> {
  const scanJob = await prisma.scanJob.create({
    data: {
      userId: userId ?? undefined,
      websiteId,
      type,
      status,
    },
  });

  if (autoStart) {
    // Intentionally not awaited  we don&apos;t want
    // HTTP requests or cron handlers to block on
    // a full scan.
    void runScanJob(scanJob.id);
  }

  return scanJob;
}
