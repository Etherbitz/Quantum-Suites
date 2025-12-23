import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get("websiteId");

  const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
  const days = rawPlan === "business" ? 90 : 7;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const scans = await prisma.scanJob.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
      score: { not: null },
      createdAt: { gte: since },
      ...(websiteId ? { websiteId } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      score: true,
      website: {
        select: { id: true, url: true },
      },
    },
  });

  return NextResponse.json({
    days,
    points: scans.map((scan) => ({
      date: scan.createdAt,
      score: scan.score,
      websiteId: scan.website?.id,
      website: scan.website?.url ?? "Unknown",
    })),
  });
}
