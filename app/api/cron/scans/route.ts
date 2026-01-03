import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { runDueWebsiteScans } from "@/lib/cron/scanScheduler";
import { prisma } from "@/lib/db";
import { executeScan } from "@/services/scanService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  const headersList = await headers();
  const isVercelCron = headersList.get("x-vercel-cron") === "1";

  if (!isVercelCron) {
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Hygiene: fail stale queued jobs so they don't accumulate forever.
  // - Non-scheduled jobs should not stay queued long.
  // - Scheduled jobs get a longer leash, but very old ones are almost always stuck.
  const now = new Date();
  const NON_SCHEDULED_STALE_MS = 60 * 60 * 1000; // 60 minutes
  const SCHEDULED_STALE_MS = 48 * 60 * 60 * 1000; // 48 hours

  const [cleanedNonScheduled, cleanedScheduled] = await Promise.all([
    prisma.scanJob.updateMany({
      where: {
        status: "QUEUED",
        type: { not: "scheduled" },
        createdAt: { lt: new Date(now.getTime() - NON_SCHEDULED_STALE_MS) },
      },
      data: {
        status: "FAILED",
        error: "STALE_QUEUED_TIMEOUT",
        finishedAt: now,
      },
    }),
    prisma.scanJob.updateMany({
      where: {
        status: "QUEUED",
        type: "scheduled",
        createdAt: { lt: new Date(now.getTime() - SCHEDULED_STALE_MS) },
      },
      data: {
        status: "FAILED",
        error: "STALE_SCHEDULED_QUEUE_TIMEOUT",
        finishedAt: now,
      },
    }),
  ]);

  const { triggered } = await runDueWebsiteScans();

  const BATCH_SIZE = Number(process.env.SCAN_EXECUTOR_BATCH_SIZE ?? "5");

  const queuedJobs = await prisma.scanJob.findMany({
    where: {
      status: "QUEUED",
      type: "scheduled",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: BATCH_SIZE,
    select: {
      id: true,
    },
  });

  let executed = 0;

  for (const job of queuedJobs) {
    try {
      await executeScan(job.id);
      executed += 1;
    } catch (err) {
      console.error("CRON_SCAN_EXECUTOR_FAILED", job.id, err);
    }
  }

  return NextResponse.json({
    ok: true,
    scheduledWebsites: triggered,
    executedJobs: executed,
    cleanedQueued: {
      nonScheduled: cleanedNonScheduled.count,
      scheduled: cleanedScheduled.count,
    },
  });
}
