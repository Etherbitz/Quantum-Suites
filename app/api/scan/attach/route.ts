import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Attaches an anonymous scan to the authenticated user.
 */
export async function POST(req: Request) {
  const { scanId } = await req.json();
  const { userId } = await auth();

  if (!userId || !scanId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.scan.update({
    where: { id: scanId },
    data: { userId },
  });

  return NextResponse.json({ success: true });
}
