import { prisma } from "@/lib/db";

export async function getOrCreateUser(
  clerkId: string,
  email: string
) {
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
