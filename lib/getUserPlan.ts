// lib/getUserPlan.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getUserPlan() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true },
  });

  return user?.plan ?? null;
}
