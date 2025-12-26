import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { deleteScan } from "@/services/scanService";

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

    try {
      await deleteScan({ scanId, userId: user.id });
    } catch (error) {
      if (error instanceof Error && error.message === "SCAN_NOT_FOUND") {
        return NextResponse.json(
          { error: "SCAN_NOT_FOUND" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE_SCAN_FAILED", error);
    return NextResponse.json(
      { error: "DELETE_FAILED" },
      { status: 500 }
    );
  }
}
