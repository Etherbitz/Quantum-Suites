import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<User> {
  const normalizedEmail = email.toLowerCase();

  return prisma.user.upsert({
    where: { clerkId },
    // Do not override role here; it is managed explicitly (e.g. via admin tools/Prisma Studio)
    update: { email: normalizedEmail },
    create: {
      clerkId,
      email: normalizedEmail,
      plan: "free",
      role: "USER",
    },
  });
}
