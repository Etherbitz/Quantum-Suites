import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      plan: "free",
    },
  });
}
