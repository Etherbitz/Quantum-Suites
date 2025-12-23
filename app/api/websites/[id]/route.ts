import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const website = await prisma.website.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!website || !website.userId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user || website.userId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const scanJobs = await prisma.scanJob.findMany({
    where: { websiteId: website.id },
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

  await prisma.website.delete({ where: { id: website.id } });

  return NextResponse.json({ success: true });
}
