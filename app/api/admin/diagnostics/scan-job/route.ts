import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId");

  if (!scanId) {
    return NextResponse.json({ error: "MISSING_SCAN_ID" }, { status: 400 });
  }

  const scanJob = await prisma.scanJob.findUnique({
    where: { id: scanId },
    select: {
      id: true,
      type: true,
      userId: true,
      status: true,
      createdAt: true,
      user: { select: { email: true, clerkId: true } },
      website: { select: { url: true } },
    },
  });

  if (!scanJob) {
    return NextResponse.json({ error: "SCAN_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ scanJob });
}
