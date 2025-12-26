import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { NextResponse } from "next/server";
import { createScan, ScanServiceError } from "@/services/scanService";

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

    const { scanJob } = await createScan({
      userId: user.id,
      url: normalizedUrl,
    });

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
          { error: "SCAN_FREQUENCY_LIMIT" },
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
