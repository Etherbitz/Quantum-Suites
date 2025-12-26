import { prisma } from "@/lib/db";
import { PLAN_ALERT_CONFIG, type AlertPlan } from "@/lib/alerts/planAlertConfig";
import { evaluateComplianceDropAlert } from "@/lib/alerts/complianceAlerts";

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

export async function maybeCreateComplianceDropAlert(params: {
  userId: string;
  plan: string;
  scanJobId: string | null;
  previousScore: number | null;
  currentScore: number | null;
  dropThresholdOverride?: number | null;
  cooldownOverrideHours?: number | null;
}) {
  const {
    userId,
    plan,
    scanJobId,
    previousScore,
    currentScore,
    dropThresholdOverride,
    cooldownOverrideHours,
  } = params;

  if (
    typeof previousScore !== "number" ||
    typeof currentScore !== "number"
  ) {
    return null;
  }

  const normalizedPlan = plan.toLowerCase() as AlertPlan;
  const config = PLAN_ALERT_CONFIG[normalizedPlan] ?? PLAN_ALERT_CONFIG.free;

  if (!config.enabled || config.mode === "none") {
    return null;
  }

  const dropThreshold =
    typeof dropThresholdOverride === "number"
      ? dropThresholdOverride
      : config.dropThreshold;

  const drop = evaluateComplianceDropAlert(
    currentScore,
    previousScore,
    dropThreshold
  );

  if (!drop) return null;

  const lastAlert = await prisma.complianceAlert.findFirst({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
  });

  if (lastAlert) {
    const hours =
      typeof cooldownOverrideHours === "number"
        ? cooldownOverrideHours
        : config.cooldownHours;

    const diffMs = Date.now() - lastAlert.createdAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < hours) {
      return null;
    }
  }

  const alert = await prisma.complianceAlert.create({
    data: {
      userId,
      scanJobId,
      previousScore: drop.previousScore,
      currentScore: drop.currentScore,
      delta: drop.delta,
      severity: drop.severity,
    },
  });

  try {
    await (prisma as any).alertAudit.create({
      data: {
        alertId: alert.id,
        userId,
        scanJobId: scanJobId ?? null,
        dropThreshold,
        delta: drop.delta,
        previousScore: drop.previousScore,
        currentScore: drop.currentScore,
      },
    });
  } catch (auditErr) {
    console.error("ALERT_AUDIT_LOG_FAILED", auditErr);
  }

  return alert;
}

