import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  let body: { jobId?: string; all?: boolean } = {};
  try {
    body = (await req.json()) as { jobId?: string; all?: boolean };
  } catch {
    body = {};
  }

  const { jobId, all } = body;

  if (jobId) {
    await prisma.complianceAlert.deleteMany({
      where: { scanJobId: jobId },
    });

    await prisma.scanJob.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ success: true });
  }

  if (all) {
    await prisma.complianceAlert.deleteMany({});
    await prisma.scanJob.deleteMany({});

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "INVALID_REQUEST" },
    { status: 400 }
  );
}
