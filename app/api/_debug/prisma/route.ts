import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * DEBUG: Prisma connectivity + singleton sanity check.
 *
 * This route is available only in non-production environments to
 * avoid exposing internal diagnostics in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Minimal query that touches the DB
    const userCount = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      userCount,
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Prisma sanity check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Prisma sanity check failed",
      },
      { status: 500 }
    );
  }
}
