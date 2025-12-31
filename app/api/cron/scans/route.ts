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

  const { triggered } = await runDueWebsiteScans();

  const BATCH_SIZE = Number(process.env.SCAN_EXECUTOR_BATCH_SIZE ?? "5");

  const queuedJobs = await prisma.scanJob.findMany({
    where: {
      status: "QUEUED",
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
  });
}
