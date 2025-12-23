import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const scanJobs = await prisma.scanJob.findMany({
    where: { userId: user.id },
    select: { id: true },
  });

  const jobIds = scanJobs.map((job) => job.id);

  if (jobIds.length > 0) {
    await prisma.complianceAlert.deleteMany({
      where: { scanJobId: { in: jobIds } },
    });

    await prisma.scanJob.deleteMany({
      where: { id: { in: jobIds } },
    });
  }

  return NextResponse.json({ success: true });
}
