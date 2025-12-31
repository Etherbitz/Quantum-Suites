import { prisma } from "@/lib/db";
import { canScanNow } from "@/lib/planGuards";
import { PLANS, type Plan } from "@/lib/plans";
import { PLAN_SCAN_INTERVALS } from "@/lib/scanner/scanIntervals";
import { computeNextScanAt } from "@/lib/scanner/nextScan";
import { ScanEngine } from "@/lib/scanner/engine";
import { runPartialScan } from "@/lib/scanner/partialScan";
import { maybeCreateComplianceDropAlert } from "@/services/alertService";
import { Prisma, type ScanJob, type ScanStatus } from "@prisma/client";

export type ScanJobType = "manual" | "scheduled" | "anonymous" | string;

interface QueueScanJobParams {
  userId: string | null;
  websiteId: string;
  type: ScanJobType;
  status?: ScanStatus;
}

export type ScanServiceErrorCode =
  | "WEBSITE_LIMIT_REACHED"
  | "SCAN_FREQUENCY_LIMIT"
  | "EXECUTION_RATE_LIMIT";

export class ScanServiceError extends Error {
  code: ScanServiceErrorCode;

  constructor(code: ScanServiceErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const PUBLIC_ANON_CLERK_ID = "public-anonymous" as const;

/**
 * Central place to create and kick off scan jobs.
 *
 * API routes, cron jobs, and future workers should
 * call this instead of touching ScanJob directly.
 */
export async function queueScanJob({
  userId,
  websiteId,
  type,
  status = "QUEUED",
}: QueueScanJobParams): Promise<ScanJob> {
  const scanJob = await prisma.scanJob.create({
    data: {
      userId: userId ?? undefined,
      websiteId,
      type,
      status,
    },
  });

  return scanJob;
}

interface CreateScanInput {
  userId: string;
  url: string;
  allowUnlimited?: boolean;
}

export async function createScan({
  userId,
  url,
  allowUnlimited = process.env.ALLOW_UNLIMITED_SCANS === "true",
}: CreateScanInput): Promise<{ scanJob: ScanJob }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
  const planKey: Plan =
    rawPlan === "starter" || rawPlan === "business" || rawPlan === "agency"
      ? (rawPlan as Plan)
      : "free";

  const plan = PLANS[planKey];
  const planLimit = plan.websites;

  // Per-plan execution rate limiting (simple rolling 1-hour window)
  if (!allowUnlimited && plan.rateLimitPerHour && plan.rateLimitPerHour > 0) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentJobsCount = await prisma.scanJob.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentJobsCount >= plan.rateLimitPerHour) {
      throw new ScanServiceError("EXECUTION_RATE_LIMIT");
    }
  }

  const existingWebsite = await prisma.website.findFirst({
    where: {
      userId: user.id,
      url,
    },
  });

  if (!allowUnlimited && !existingWebsite && planLimit !== Infinity) {
    const websiteCount = await prisma.website.count({
      where: { userId: user.id },
    });

    if (websiteCount >= planLimit) {
      throw new ScanServiceError("WEBSITE_LIMIT_REACHED");
    }
  }

  const website =
    existingWebsite ??
    (await prisma.website.create({
      data: {
        userId: user.id,
        url,
      },
    }));

  const lastJob = await prisma.scanJob.findFirst({
    where: { websiteId: website.id },
    orderBy: { createdAt: "desc" },
  });

  if (!canScanNow(planKey, lastJob?.createdAt ?? null)) {
    throw new ScanServiceError("SCAN_FREQUENCY_LIMIT");
  }

  const scanJob = await queueScanJob({
    userId: user.id,
    websiteId: website.id,
    type: "manual",
  });

  let nextScanAt: Date | null = null;
  const intervalMinutes = PLAN_SCAN_INTERVALS[planKey];

  if (intervalMinutes && !website.nextScanAt) {
    nextScanAt = computeNextScanAt(new Date(), intervalMinutes);
  }

  if (planKey === "starter" && !website.nextScanAt) {
    nextScanAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  if (nextScanAt) {
    await prisma.website.update({
      where: { id: website.id },
      data: {
        nextScanAt,
      },
    });
  }

  return { scanJob };
}

export async function deleteScan({
  scanId,
  userId,
}: {
  scanId: string;
  userId: string;
}): Promise<void> {
  const scan = await prisma.scanJob.findFirst({
    where: {
      id: scanId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!scan) {
    throw new Error("SCAN_NOT_FOUND");
  }

  await prisma.complianceAlert.deleteMany({
    where: {
      scanJobId: scan.id,
      userId,
    },
  });

  await prisma.scanJob.delete({
    where: {
      id: scan.id,
    },
  });
}

export async function executeScan(scanJobId: string): Promise<{
  scanId: string;
  completed: boolean;
  complianceScore?: number;
  alertsTriggered: number;
}> {
  const startedAt = Date.now();

  const logPhase = (payload: {
    phase: string;
    outcome?: string;
    scanId?: string;
    userId?: string | null;
    plan?: string | null;
    durationMs?: number;
    errorCode?: string | null;
    extra?: Record<string, unknown>;
  }) => {
    const {
      phase,
      outcome,
      scanId,
      userId,
      plan,
      durationMs,
      errorCode,
      extra,
    } = payload;

    console.log(
      JSON.stringify({
        type: "scan-execution",
        phase,
        outcome,
        scanId: scanId ?? scanJobId,
        userId,
        plan,
        durationMs,
        errorCode,
        ...extra,
        timestamp: new Date().toISOString(),
      })
    );
  };

  logPhase({ phase: "start" });

  // Phase 0: Load scan + guards
  const job = await prisma.scanJob.findUnique({
    where: { id: scanJobId },
    include: {
      website: true,
      user: {
        select: {
          id: true,
          clerkId: true,
          plan: true,
        },
      },
    },
  });

  if (!job) {
    logPhase({
      phase: "load",
      outcome: "not_found",
    });
    return {
      scanId: scanJobId,
      completed: false,
      alertsTriggered: 0,
    };
  }

  const isPublicScan = job.user?.clerkId === PUBLIC_ANON_CLERK_ID;

  if (job.status !== "QUEUED") {
    logPhase({
      phase: "guard_status",
      outcome: "skipped",
      userId: job.userId,
      plan: typeof job.user?.plan === "string" ? job.user.plan : null,
    });
    return {
      scanId: job.id,
      completed: false,
      complianceScore: job.score ?? undefined,
      alertsTriggered: 0,
    };
  }

  // Per-plan concurrency: cap QUEUED/RUNNING jobs per user
  if (job.userId && job.user?.plan) {
    const rawPlan =
      typeof job.user.plan === "string"
        ? job.user.plan.toLowerCase()
        : "free";
    const planKey: Plan =
      rawPlan === "starter" || rawPlan === "business" || rawPlan === "agency"
        ? (rawPlan as Plan)
        : "free";

    const maxConcurrent = PLANS[planKey].maxConcurrentScans;

    if (maxConcurrent && maxConcurrent !== Infinity) {
      const activeJobs = await prisma.scanJob.count({
        where: {
          userId: job.userId,
          status: {
            in: ["RUNNING"],
          },
          id: {
            not: job.id,
          },
        },
      });

      if (activeJobs >= maxConcurrent) {
        const durationMs = Date.now() - startedAt;

        await prisma.scanJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: "CONCURRENCY_LIMIT",
          },
        });

        logPhase({
          phase: "guard_concurrency",
          outcome: "concurrency_limit",
          userId: job.userId,
          plan: planKey,
          durationMs,
          errorCode: "CONCURRENCY_LIMIT",
        });

        try {
          await (prisma as any).scanExecutionLog.create({
            data: {
              scanJobId: job.id,
              userId: job.userId,
              phase: "guard_concurrency",
              status: "concurrency_limit",
              durationMs,
              errorCode: "CONCURRENCY_LIMIT",
            },
          });
        } catch (logErr) {
          console.error("SCAN_EXECUTION_LOG_FAILED", logErr);
        }

        return {
          scanId: job.id,
          completed: false,
          alertsTriggered: 0,
        };
      }
    }
  }

  if (!job.website?.url) {
    await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: "WEBSITE_NOT_FOUND",
      },
    });

    const durationMs = Date.now() - startedAt;

    logPhase({
      phase: "guard_website",
      outcome: "website_not_found",
      userId: job.userId,
      plan: typeof job.user?.plan === "string" ? job.user.plan : null,
      durationMs,
      errorCode: "WEBSITE_NOT_FOUND",
    });

    try {
      await (prisma as any).scanExecutionLog.create({
        data: {
          scanJobId: job.id,
          userId: job.userId,
          phase: "guard_website",
          status: "website_not_found",
          durationMs,
          errorCode: "WEBSITE_NOT_FOUND",
        },
      });
    } catch (logErr) {
      console.error("SCAN_EXECUTION_LOG_FAILED", logErr);
    }

    return {
      scanId: job.id,
      completed: false,
      alertsTriggered: 0,
    };
  }

  await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    // Phase 1: Execute scan mechanics
    const engine = new ScanEngine();

    console.log("ENGINE_SCAN_START", job.website.url);

    const result = await engine.scan(job.website.url);

    // Phase 2: Persist results
    const serializedIssues: Prisma.InputJsonArray =
      result.issues.map((issue) =>
        JSON.parse(JSON.stringify(issue))
      );

    const significantIssues = result.issues.filter(
      (issue) =>
        issue.severity === "critical" ||
        issue.severity === "warning"
    );

    const topForSummary =
      significantIssues.length > 0
        ? significantIssues
        : result.issues;

    const updated = await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        score: result.score,
        summary: {
          mode: "full",
          riskLevel: result.riskLevel,
          topIssues: topForSummary
            .slice(0, 5)
            .map((issue) => {
              const sevLabel =
                issue.severity === "critical"
                  ? "Critical"
                  : issue.severity === "warning"
                  ? "Warning"
                  : "Info";
                return `${sevLabel} • ${issue.category} • ${issue.title}`;
            }),
        },
        results: serializedIssues,
      },
    });

    // Phase 3: Post-scan effects (alerts, analytics)
    let alertsTriggered = 0;

    if (!isPublicScan && job.userId) {
      const previous = await prisma.scanJob.findFirst({
        where: {
          websiteId: job.websiteId ?? undefined,
          userId: job.userId,
          status: "COMPLETED",
          id: { not: job.id },
        },
        orderBy: { finishedAt: "desc" },
        select: { score: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: job.userId },
        select: { plan: true, alertDropThreshold: true },
      });

      if (user) {
        const alert = await maybeCreateComplianceDropAlert({
          userId: job.userId,
          plan: user.plan,
          scanJobId: updated.id,
          previousScore: previous?.score ?? null,
          currentScore: updated.score ?? null,
          dropThresholdOverride: user.alertDropThreshold ?? null,
        });

        if (alert) {
          alertsTriggered += 1;
        }
      }
    }

    const durationMs = Date.now() - startedAt;

    logPhase({
      phase: "complete",
      outcome: "success",
      userId: job.userId,
      plan: typeof job.user?.plan === "string" ? job.user.plan : null,
      durationMs,
    });

    try {
      await (prisma as any).scanExecutionLog.create({
        data: {
          scanJobId: updated.id,
          userId: job.userId,
          phase: "complete",
          status: "success",
          durationMs,
          errorCode: null,
        },
      });
    } catch (logErr) {
      console.error("SCAN_EXECUTION_LOG_FAILED", logErr);
    }

    // Phase 4: Return summary
    return {
      scanId: updated.id,
      completed: true,
      complianceScore: updated.score ?? undefined,
      alertsTriggered,
    };
  } catch (err) {
    console.error("ENGINE_SCAN_FAILED", err);

    const reason =
      err instanceof Error ? err.message : "UNKNOWN_ERROR";

    let partialResult: unknown = null;

    try {
      // Phase 1 (fallback): partial scan mechanics
      partialResult = await runPartialScan(job.website.url);
    } catch (partialErr) {
      console.error("PARTIAL_SCAN_FAILED", partialErr);
    }

    if (partialResult) {
      // Phase 2 (fallback): persist partial results
      await prisma.scanJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          score: 0,
          summary: {
            mode: "partial",
            reason,
          },
          results: partialResult,
          error: reason,
        },
      });

      // Phase 3: no alerts for partial scans

      const durationMs = Date.now() - startedAt;

      logPhase({
        phase: "complete",
        outcome: "partial",
        userId: job.userId,
        plan: typeof job.user?.plan === "string" ? job.user.plan : null,
        durationMs,
        errorCode: reason,
      });

      try {
        await (prisma as any).scanExecutionLog.create({
          data: {
            scanJobId: job.id,
            userId: job.userId,
            phase: "complete",
            status: "partial",
            durationMs,
            errorCode: reason,
          },
        });
      } catch (logErr) {
        console.error("SCAN_EXECUTION_LOG_FAILED", logErr);
      }

      return {
        scanId: job.id,
        completed: true,
        complianceScore: 0,
        alertsTriggered: 0,
      };
    }

    await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: reason,
      },
    });

    const durationMs = Date.now() - startedAt;

    logPhase({
      phase: "complete",
      outcome: "failed",
      userId: job.userId,
      plan: typeof job.user?.plan === "string" ? job.user.plan : null,
      durationMs,
      errorCode: reason,
    });

    try {
      await (prisma as any).scanExecutionLog.create({
        data: {
          scanJobId: job.id,
          userId: job.userId,
          phase: "complete",
          status: "failed",
          durationMs,
          errorCode: reason,
        },
      });
    } catch (logErr) {
      console.error("SCAN_EXECUTION_LOG_FAILED", logErr);
    }

    return {
      scanId: job.id,
      completed: false,
      alertsTriggered: 0,
    };
  }
}

