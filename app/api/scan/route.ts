import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queueScanJob, executeScan } from "@/services/scanService";

function normalizeHttpUrl(raw: unknown): string {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return "";

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return "";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
  return parsed.toString();
}

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
      error: true,
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
    error: scan.error,
  });
}

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };

    const normalizedUrl = normalizeHttpUrl(url);

    if (!normalizedUrl) {
      return NextResponse.json(
        { error: "MISSING_URL" },
        { status: 400 }
      );
    }

    const parsed = new URL(normalizedUrl);

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

    // Lightweight abuse protection: cap anonymous scans per hour
    // NOTE: Anonymous scans are attached to a shared user. Using plan limits here
    // would rate-limit the entire site (e.g. free plan = 3/hr). Instead, use a
    // dedicated env var so we can tune this safely.
    const anonRateLimitPerHour = Number(
      process.env.ANON_SCAN_RATE_LIMIT_PER_HOUR ?? "30"
    );
    if (Number.isFinite(anonRateLimitPerHour) && anonRateLimitPerHour > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentAnonScans = await prisma.scanJob.count({
        where: {
          userId: anonUser.id,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      if (recentAnonScans >= anonRateLimitPerHour) {
        return NextResponse.json(
          { error: "EXECUTION_RATE_LIMIT" },
          { status: 429 }
        );
      }
    }

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

    const job = await queueScanJob({
      userId: anonUser.id,
      websiteId: website.id,
      type: "anonymous",
    });

    // Execute anonymous scans synchronously so the caller
    // can immediately poll for a completed result.
    await executeScan(job.id);

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
