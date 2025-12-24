import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(
  clerkId: string,
  email: string
): Promise<User> {
  const normalizedEmail = email.toLowerCase();

  const isAdminEmail =
    normalizedEmail === "admin@quantumsuites-ai.com";

  // 1) If we already have a user for this Clerk ID, update its email/role.
  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { id: existingByClerk.id },
      data: {
        email: normalizedEmail,
        ...(isAdminEmail && { role: "ADMIN" }),
      },
    });
  }

  // 2) Otherwise, try to reuse an existing record with this email
  //    so we never create multiple accounts for the same address.
  const existingByEmail = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId,
        email: normalizedEmail,
        ...(isAdminEmail && { role: "ADMIN" }),
      },
    });
  }

  // 3) No existing user — create a new one.
  return prisma.user.create({
    data: {
      clerkId,
      email: normalizedEmail,
      plan: isAdminEmail ? "agency" : "free",
      role: isAdminEmail ? "ADMIN" : "USER",
    },
  });
}
