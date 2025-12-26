import { prisma } from "@/lib/db";

export async function updateUserPlanFromMetadata(params: {
  userId?: string | null;
  planName?: string | null;
  status?: string | null;
}) {
  const { userId, planName, status } = params;

  if (!userId || !planName) {
    console.error("Missing metadata for billing update");
    return;
  }

  const normalizedPlan = planName.toLowerCase();

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: status && status !== "active" ? "free" : normalizedPlan,
    },
  });
}
