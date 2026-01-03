import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

/**
 * Attaches an anonymous scan to the authenticated user.
 *
 * Only scans without an owner can be attached. If a scan already belongs
 * to another user, the operation is forbidden.
 */
export async function POST(req: Request) {
  try {
    const { scanId } = (await req.json()) as { scanId?: string };
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!scanId || !userId) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const emailFromClerk = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
    const emailFromClaims =
      typeof (sessionClaims as any)?.email === "string" ? (sessionClaims as any).email : null;

    const user = await getOrCreateUser(userId, emailFromClerk ?? emailFromClaims);

    const anonUser = await prisma.user.findUnique({
      where: { clerkId: "public-anonymous" },
      select: { id: true },
    });

    const scanJob = await prisma.scanJob.findUnique({
      where: { id: scanId },
      select: { id: true, userId: true, type: true },
    });

    if (!scanJob) {
      return NextResponse.json({ error: "SCAN_NOT_FOUND" }, { status: 404 });
    }

    const isOwnedByPublicAnon =
      !!anonUser?.id && scanJob.userId === anonUser.id;

    // Allow attaching scans that are either:
    // - unowned (userId is null), or
    // - owned by the shared public-anonymous user.
    // Disallow attaching scans owned by any other user.
    if (scanJob.userId && scanJob.userId !== user.id && !isOwnedByPublicAnon) {
      return NextResponse.json({ error: "ALREADY_OWNED" }, { status: 403 });
    }

    // If it is already attached to this user, treat as success.
    if (scanJob.userId === user.id) {
      return NextResponse.json({ success: true });
    }

    // Only allow attaching anonymous scans.
    if (scanJob.type !== "anonymous") {
      return NextResponse.json({ error: "INVALID_SCAN_TYPE" }, { status: 400 });
    }

    await prisma.scanJob.update({
      where: { id: scanJob.id },
      data: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ATTACH_SCAN_FAILED", err);
    return NextResponse.json(
      { error: "ATTACH_FAILED" },
      { status: 500 }
    );
  }
}
