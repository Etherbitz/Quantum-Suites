import { prisma } from "@/lib/db";
import { ScanEngine } from "@/lib/scanner/engine";
import { runPartialScan } from "@/lib/scanner/partialScan";
import { Prisma } from "@prisma/client";

type RunScanJobResult =
  | { status: "completed"; scanId: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export async function runScanJob(
  scanJobId: string
): Promise<RunScanJobResult> {
  console.log("RUN_SCAN_JOB_START", scanJobId);

  const job = await prisma.scanJob.findUnique({
    where: { id: scanJobId },
    include: { website: true },
  });

  console.log("JOB_FETCHED", {
    status: job?.status,
    hasWebsite: !!job?.website,
    url: job?.website?.url,
  });

  if (!job) {
    return { status: "skipped", reason: "JOB_NOT_FOUND" };
  }

  if (job.status !== "QUEUED") {
    return {
      status: "skipped",
      reason: `JOB_STATUS_${job.status}`,
    };
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

    return { status: "failed", error: "WEBSITE_NOT_FOUND" };
  }

  // Lock job
  await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const engine = new ScanEngine();

    console.log("ENGINE_SCAN_START", job.website.url);

    const result = await engine.scan(job.website.url);

    const serializedIssues: Prisma.InputJsonArray =
      result.issues.map((issue) =>
        JSON.parse(JSON.stringify(issue))
      );

    const significantIssues = result.issues.filter(
      (issue) => issue.severity === "critical" || issue.severity === "warning"
    );

    const topForSummary =
      significantIssues.length > 0
        ? significantIssues
        : result.issues;

    await prisma.scanJob.update({
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

    return { status: "completed", scanId: job.id };
  } catch (err) {
    console.error("ENGINE_SCAN_FAILED", err);

    const reason =
      err instanceof Error ? err.message : "UNKNOWN_ERROR";

    let partialResult: unknown = null;

    try {
      partialResult = await runPartialScan(job.website.url);
    } catch (partialErr) {
      console.error("PARTIAL_SCAN_FAILED", partialErr);
    }

    if (partialResult) {
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

      return {
        status: "failed",
        error: reason,
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

    return {
      status: "failed",
      error: reason,
    };
  }
}
