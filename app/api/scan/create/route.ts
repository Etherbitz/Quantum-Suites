import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { NextResponse } from "next/server";
import { createScan, executeScan, ScanServiceError } from "@/services/scanService";

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
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return NextResponse.json(
        { error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const emailFromClerk = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
    const emailFromClaims =
      typeof (sessionClaims as any)?.email === "string" ? (sessionClaims as any).email : null;

    const user = await getOrCreateUser(userId, emailFromClerk ?? emailFromClaims);

    const { url } = await req.json();

    const normalizedUrl = normalizeHttpUrl(url);

    if (!normalizedUrl) {
      return NextResponse.json(
        { error: "MISSING_URL" },
        { status: 400 }
      );
    }

    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return NextResponse.json(
        {
          error: "LOCALHOST_NOT_SUPPORTED",
          reason: "Localhost URLs cannot be scanned",
        },
        { status: 400 }
      );
    }

    const { scanJob } = await createScan({
      userId: user.id,
      url: normalizedUrl,
    });

    // Run the scan synchronously so users see results immediately.
    await executeScan(scanJob.id);

    return NextResponse.json({
      scanId: scanJob.id,
    });
  } catch (err) {
    if (err instanceof ScanServiceError) {
      if (err.code === "WEBSITE_LIMIT_REACHED") {
        return NextResponse.json(
          { error: "WEBSITE_LIMIT_REACHED" },
          { status: 403 }
        );
      }

      if (err.code === "SCAN_FREQUENCY_LIMIT") {
        return NextResponse.json(
          {
            error: "SCAN_FREQUENCY_LIMIT",
            nextAllowedAt:
              typeof err.meta?.nextAllowedAt === "string"
                ? err.meta.nextAllowedAt
                : null,
          },
          { status: 429 }
        );
      }

      if (err.code === "EXECUTION_RATE_LIMIT") {
        return NextResponse.json(
          { error: "EXECUTION_RATE_LIMIT" },
          { status: 429 }
        );
      }
    }

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
