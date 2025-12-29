import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ plan: null });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true },
  });

  return NextResponse.json({ plan: user?.plan ?? null });
}
