import { prisma } from "@/lib/db";

export async function listRecentAlertsForUser(userId: string, limit = 10) {
  return prisma.complianceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function acknowledgeAlert(id: string) {
  await prisma.complianceAlert.update({
    where: { id },
    data: { acknowledged: true },
  });
}
