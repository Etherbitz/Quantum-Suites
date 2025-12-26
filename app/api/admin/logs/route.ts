import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteScan } from "@/services/scanService";

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

  let body: { jobId?: string; all?: boolean; confirm?: string } = {};
  try {
    body = (await req.json()) as { jobId?: string; all?: boolean };
  } catch {
    body = {};
  }

  const { jobId, all } = body;

  if (jobId) {
    const scan = await prisma.scanJob.findUnique({
      where: { id: jobId },
      select: { id: true, userId: true },
    });

    if (scan?.userId) {
      await deleteScan({
        scanId: scan.id,
        userId: scan.userId,
      });
    } else {
      await prisma.complianceAlert.deleteMany({
        where: { scanJobId: jobId },
      });

      await prisma.scanJob.delete({
        where: { id: jobId },
      });
    }

    return NextResponse.json({ success: true });
  }

  if (all) {
    if (body.confirm !== "DELETE_ALL_SCANS") {
      return NextResponse.json(
        { error: "CONFIRMATION_REQUIRED" },
        { status: 400 }
      );
    }

    console.log(
      JSON.stringify({
        type: "admin-action",
        action: "DELETE_ALL_SCANS",
        performedBy: userId,
        timestamp: new Date().toISOString(),
      })
    );

    await prisma.complianceAlert.deleteMany({});
    await prisma.scanJob.deleteMany({});

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "INVALID_REQUEST" },
    { status: 400 }
  );
}
