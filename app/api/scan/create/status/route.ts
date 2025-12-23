import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Returns current scan status
 * GET /api/scan/create/status?scanId=xxx
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId");

  if (!scanId) {
    return NextResponse.json(
      { error: "Missing scanId" },
      { status: 400 }
    );
  }

  const scan = await prisma.scanJob.findUnique({
    where: { id: scanId },
    select: {
      id: true,
      status: true,
      score: true,
      createdAt: true,
    },
  });

  if (!scan) {
    return NextResponse.json(
      { error: "Scan not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(scan);
}
