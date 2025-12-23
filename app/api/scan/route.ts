import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runScanJob } from "@/lib/scanner/runScanJob";

export const runtime = "nodejs";

/**
 * GET /api/scan?scanId=xxx  → returns current scan status
 * POST /api/scan            → creates a one-off anonymous scan
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId") ?? searchParams.get("jobId");

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

  return NextResponse.json({
    scanId: scan.id,
    status: scan.status.toLowerCase(),
    score: scan.score,
    createdAt: scan.createdAt,
  });
}

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };

    const normalizedUrl = typeof url === "string" ? url.trim() : "";

    if (!normalizedUrl) {
      return NextResponse.json(
        { error: "MISSING_URL" },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: "INVALID_URL", reason: "URL could not be parsed" },
        { status: 400 }
      );
    }

    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return NextResponse.json(
        {
          error: "LOCALHOST_NOT_SUPPORTED",
          reason: "Localhost URLs cannot be scanned",
        },
        { status: 400 }
      );
    }
    // For anonymous scans we still need a Website record so the
    // scan job has a URL to operate on. We attach them to a
    // shared "public" user.

    const ANON_CLERK_ID = "public-anonymous";

    const anonUser = await prisma.user.upsert({
      where: { clerkId: ANON_CLERK_ID },
      update: {},
      create: {
        clerkId: ANON_CLERK_ID,
        email: "anonymous@quantumsuites-ai.com",
        plan: "free",
      },
    });

    const website = await prisma.website.upsert({
      where: {
        userId_url: {
          userId: anonUser.id,
          url: normalizedUrl,
        },
      },
      update: {},
      create: {
        userId: anonUser.id,
        url: normalizedUrl,
      },
    });

    const job = await prisma.scanJob.create({
      data: {
        userId: anonUser.id,
        websiteId: website.id,
        type: "anonymous",
        status: "QUEUED",
      },
    });

    // Fire-and-forget anonymous scan
    runScanJob(job.id);

    return NextResponse.json({ scanId: job.id });
  } catch (error) {
    console.error("ANON_SCAN_FAILED", error);
    return NextResponse.json(
      {
        error: "SCAN_FAILED",
        reason:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
