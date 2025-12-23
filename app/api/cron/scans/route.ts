import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PLAN_SCAN_INTERVALS } from "@/lib/scanner/scanIntervals";
import { computeNextScanAt } from "@/lib/scanner/nextScan";
import { runScanJob } from "@/lib/scanner/runScanJob";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();

  // Find websites that are due for scanning
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

    // Create scan job
    const scanJob = await prisma.scanJob.create({
      data: {
        userId: website.userId,
        websiteId: website.id,
        type: "scheduled",
        status: "QUEUED",
      },
    });

    // Update next scan time
    await prisma.website.update({
      where: { id: website.id },
      data: {
        nextScanAt: computeNextScanAt(now, interval),
      },
    });

    // Fire scan
    runScanJob(scanJob.id);

    triggered++;
  }

  return NextResponse.json({
    ok: true,
    triggered,
  });
}
