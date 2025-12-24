import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<User> {
  const normalizedEmail = email.toLowerCase();

  const isAdminEmail =
    normalizedEmail === "admin@quantumsuites-ai.com";

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      email: normalizedEmail,
      ...(isAdminEmail && {
        role: "ADMIN",
        plan: "agency",
      }),
    },
    create: {
      clerkId,
      email: normalizedEmail,
      plan: isAdminEmail ? "agency" : "free",
      role: isAdminEmail ? "ADMIN" : "USER",
    },
  });
}
