import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS } from "@/lib/plans";
import { canScanNow } from "@/lib/planGuards";
import { NextResponse } from "next/server";
import { runScanJob } from "@/lib/scanner/runScanJob";
import { PLAN_SCAN_INTERVALS } from "@/lib/scanner/scanIntervals";
import { computeNextScanAt } from "@/lib/scanner/nextScan";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const allowUnlimited = process.env.ALLOW_UNLIMITED_SCANS === "true";
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

    const normalizedPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
    const planKey = (normalizedPlan in PLANS ? normalizedPlan : "free") as keyof typeof PLANS;
    const plan = PLANS[planKey];

    const { url } = await req.json();

    const normalizedUrl = typeof url === "string" ? url.trim() : "";

    if (!normalizedUrl) {
      return NextResponse.json(
        { error: "MISSING_URL" },
        { status: 400 }
      );
    }

    let hostname = "";
    try {
      hostname = new URL(normalizedUrl).hostname;
    } catch (parseErr) {
      console.error("SCAN_URL_PARSE_FAILED", parseErr);
      return NextResponse.json(
        { error: "INVALID_URL", reason: "URL could not be parsed" },
        { status: 400 }
      );
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return NextResponse.json(
        {
          error: "LOCALHOST_NOT_SUPPORTED",
          reason: "Localhost URLs cannot be scanned",
        },
        { status: 400 }
      );
    }

    const planLimit = plan.websites;

    const existingWebsite = await prisma.website.findFirst({
      where: {
        userId: user.id,
        url: normalizedUrl,
      },
    });

    // -----------------------------
    // WEBSITE LIMIT (derived, safe)
    // -----------------------------
    if (!allowUnlimited && !existingWebsite && planLimit !== Infinity) {
      const websiteCount = await prisma.website.count({
        where: { userId: user.id },
      });

      if (websiteCount >= planLimit) {
        return NextResponse.json(
          { error: "WEBSITE_LIMIT_REACHED" },
          { status: 403 }
        );
      }
    }

    // -----------------------------
    // FIND OR CREATE WEBSITE
    // -----------------------------
    const website =
      existingWebsite ??
      (await prisma.website.create({
        data: {
          userId: user.id,
          url: normalizedUrl,
        },
      }));

    // -----------------------------
    // SCAN FREQUENCY CHECK (manual)
    // -----------------------------
    const lastJob = await prisma.scanJob.findFirst({
      where: { websiteId: website.id },
      orderBy: { createdAt: "desc" },
    });

    if (!canScanNow(planKey, lastJob?.createdAt ?? null)) {
      return NextResponse.json(
        { error: "SCAN_FREQUENCY_LIMIT" },
        { status: 429 }
      );
    }

    // -----------------------------
    // CREATE SCAN JOB (OWNED)
    // -----------------------------
    const scanJob = await prisma.scanJob.create({
      data: {
        userId: user.id,
        websiteId: website.id,
        type: "manual",
        status: "QUEUED",
      },
    });

    // -----------------------------
    // INITIALIZE AUTOMATION (ONCE)
    // -----------------------------
    let nextScanAt: Date | null = null;
    const intervalMinutes = PLAN_SCAN_INTERVALS[planKey];

    if (
      intervalMinutes &&
      !website.nextScanAt
    ) {
      nextScanAt = computeNextScanAt(
        new Date(),
        intervalMinutes
      );
    }

    if (planKey === "starter" && !website.nextScanAt) {
      nextScanAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    if (nextScanAt) {
      await prisma.website.update({
        where: { id: website.id },
        data: {
          nextScanAt,
        },
      });
    }

    // -----------------------------
    // START SCAN (ASYNC)
    // -----------------------------
    runScanJob(scanJob.id);

    return NextResponse.json({
      scanId: scanJob.id,
    });
  } catch (err) {
    console.error("SCAN_FAILED", err);
    return NextResponse.json(
      {
        error: "SCAN_FAILED",
        reason: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
