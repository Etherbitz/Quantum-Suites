import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";

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

  const planKeys = Object.keys(PLANS) as Plan[];
  const isValidPlan = planKeys.includes(normalizedPlan as Plan);

  const targetPlan: Plan = isValidPlan
    ? (normalizedPlan as Plan)
    : "free";

  if (!isValidPlan) {
    console.error("Invalid plan from Stripe metadata; defaulting to free", {
      userId,
      planName,
      status,
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: status && status !== "active" ? "free" : targetPlan,
    },
  });
}
