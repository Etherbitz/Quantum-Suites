import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS } from "@/lib/plans";
import { canScanNow } from "@/lib/planGuards";
import { NextResponse } from "next/server";
import { runScanJob } from "@/lib/scanner/runScanJob";
export const runtime = "nodejs";

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

  const { url } = await req.json();

  // -----------------------------
  // WEBSITE LIMIT
  // -----------------------------
  if (user.websitesUsed >= plan.websites) {
    return NextResponse.json(
      { error: "WEBSITE_LIMIT_REACHED" },
      { status: 403 }
    );
  }

  // -----------------------------
  // FIND OR CREATE WEBSITE
  // -----------------------------
  const website = await prisma.website.upsert({
    where: {
      userId_url: {
        userId: user.id,
        url,
      },
    },
    update: {},
    create: {
      userId: user.id,
      url,
    },
  });

  // -----------------------------
  // SCAN FREQUENCY CHECK
  // -----------------------------
  const lastJob = await prisma.scanJob.findFirst({
    where: { websiteId: website.id },
    orderBy: { createdAt: "desc" },
  });

  if (!canScanNow(user.plan as keyof typeof PLANS, lastJob?.createdAt || null)) {
    return NextResponse.json(
      { error: "SCAN_FREQUENCY_LIMIT" },
      { status: 429 }
    );
  }

  // -----------------------------
  // CREATE SCAN JOB
  // -----------------------------
  const scanJob = await prisma.scanJob.create({
    data: {
      websiteId: website.id,
      type: "manual",
      status: "queued",
    },
  });

  // -----------------------------
  // START SCAN IMMEDIATELY (fire-and-forget)
  // -----------------------------
  runScanJob(scanJob.id);

  return NextResponse.json({
    scanJobId: scanJob.id,
  });
}
