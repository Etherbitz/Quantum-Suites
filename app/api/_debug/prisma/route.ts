import { prisma } from "@/lib/db";
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
