import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PLAN_SCAN_INTERVALS } from "@/lib/scanner/scanIntervals";
import { computeNextScanAt } from "@/lib/scanner/nextScan";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const { websiteId, intervalMinutes, paused } = await req.json();

  const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";

  // Free users cannot schedule
  if (rawPlan === "free") {
    return NextResponse.json(
      { error: "PLAN_REQUIRED" },
      { status: 403 }
    );
  }

  // Pause automation
  if (paused === true) {
    await prisma.website.update({
      where: { id: websiteId },
      data: { nextScanAt: null },
    });

    return NextResponse.json({ ok: true });
  }

  // Resume / update automation
  const allowedInterval =
    rawPlan === "business"
      ? intervalMinutes
      : PLAN_SCAN_INTERVALS[rawPlan as keyof typeof PLAN_SCAN_INTERVALS];

  await prisma.website.update({
    where: { id: websiteId },
    data: {
      nextScanAt: computeNextScanAt(
        new Date(),
        allowedInterval
      ),
    },
  });

  return NextResponse.json({ ok: true });
}
