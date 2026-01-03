import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(
  clerkId: string,
  email?: string | null
): Promise<User> {
  const normalizedEmail =
    typeof email === "string" && email.trim().length > 0
      ? email.trim().toLowerCase()
      : null;

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
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(isAdminEmail && { role: "ADMIN", plan: "agency" }),
      },
    });
  }

  // 2) Otherwise, try to reuse an existing record with this email
  //    so we never create multiple accounts for the same address.
  if (normalizedEmail) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId,
          email: normalizedEmail,
          ...(isAdminEmail && { role: "ADMIN", plan: "agency" }),
        },
      });
    }
  }

  // 3) No existing user — create a new one.
  // Some Clerk configurations allow sign-in without an email (e.g. phone/passkey).
  // We still need a stable email-like identifier for our DB record.
  const fallbackEmail = normalizedEmail ?? `${clerkId}@users.quantumsuites-ai.invalid`;

  return prisma.user.create({
    data: {
      clerkId,
      email: fallbackEmail,
      plan: isAdminEmail ? "agency" : "free",
      role: isAdminEmail ? "ADMIN" : "USER",
    },
  });
}
