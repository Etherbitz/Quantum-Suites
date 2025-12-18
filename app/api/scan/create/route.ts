import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS } from "@/lib/plans";
import { canScanNow } from "@/lib/planGuards";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

  const plan = PLANS[user.plan as keyof typeof PLANS];

  // -----------------------------
  // ENFORCE WEBSITE LIMIT
  // -----------------------------
  if (user.websitesUsed >= plan.websites) {
    return NextResponse.json(
      {
        error: "WEBSITE_LIMIT_REACHED",
        plan: user.plan,
        websites: plan.websites,
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { url } = body;

  // -----------------------------
  // CHECK SCAN FREQUENCY
  // -----------------------------
  const lastScan = await prisma.scan.findFirst({
    where: { userId: user.id, url },
    orderBy: { createdAt: "desc" },
  });

  if (!canScanNow(user.plan as keyof typeof PLANS, lastScan?.createdAt || null)) {
    return NextResponse.json(
      { error: "SCAN_FREQUENCY_LIMIT" },
      { status: 429 }
    );
  }

  // -----------------------------
  // ENFORCE WEBSITE LIMIT
  // -----------------------------
  const scan = await prisma.scan.create({
    data: {
      url,
      userId: user.id,
      score: 0,
      riskLevel: "pending",
      summaryIssues: [],
      allIssues: {},
    },
  });

  // -----------------------------
  // INCREMENT USAGE
  // -----------------------------
  await prisma.user.update({
    where: { id: user.id },
    data: {
      websitesUsed: { increment: 1 },
    },
  });

  return NextResponse.json({ scanId: scan.id });
}
