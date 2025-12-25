import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const body = await req.json().catch(() => null) as { scanId?: string } | null;
    const scanId = body?.scanId;

    if (!scanId || typeof scanId !== "string") {
      return NextResponse.json(
        { error: "MISSING_SCAN_ID" },
        { status: 400 }
      );
    }

    const scan = await prisma.scanJob.findFirst({
      where: {
        id: scanId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: "SCAN_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Remove any alerts tied to this scan for safety
    await prisma.complianceAlert.deleteMany({
      where: {
        scanJobId: scan.id,
        userId: user.id,
      },
    });

    await prisma.scanJob.delete({
      where: {
        id: scan.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE_SCAN_FAILED", error);
    return NextResponse.json(
      { error: "DELETE_FAILED" },
      { status: 500 }
    );
  }
}
