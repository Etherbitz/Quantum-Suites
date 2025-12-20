import { prisma } from "@/lib/db";
import { ScanEngine } from "@/lib/scanner/engine";
import { Prisma } from "@prisma/client";

type RunScanJobResult =
  | { status: "completed"; scanId: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export async function runScanJob(
  scanJobId: string
): Promise<RunScanJobResult> {
  // -----------------------------
  // FETCH JOB + WEBSITE
  // -----------------------------
  const job = await prisma.scanJob.findUnique({
    where: { id: scanJobId },
    include: {
      website: true,
    },
  });

  if (!job) {
    return { status: "skipped", reason: "JOB_NOT_FOUND" };
  }

  if (job.status !== "queued") {
    return {
      status: "skipped",
      reason: `JOB_STATUS_${job.status.toUpperCase()}`,
    };
  }

  // -----------------------------
  // LOCK JOB (idempotent)
  // -----------------------------
  await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
    },
  });

  try {
    // -----------------------------
    // EXECUTE SCAN
    // -----------------------------
    const engine = new ScanEngine();
    const result = await engine.scan(job.website.url);

    const serializedIssues: Prisma.InputJsonArray =
      result.issues.map((issue) =>
        JSON.parse(JSON.stringify(issue))
      );

    // -----------------------------
    // PERSIST RESULTS
    // -----------------------------
    const scan = await prisma.scan.create({
      data: {
        websiteId: job.websiteId,
        score: result.score,
        riskLevel: result.riskLevel,
        summaryIssues: result.issues
          .slice(0, 5)
          .map(
            (issue) => `${issue.category}: ${issue.title}`
          ),
        allIssues: serializedIssues,
      },
    });

    // -----------------------------
    // COMPLETE JOB
    // -----------------------------
    await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
      },
    });

    return { status: "completed", scanId: scan.id };
  } catch (err) {
    // -----------------------------
    // FAIL JOB
    // -----------------------------
    await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
      },
    });

    return {
      status: "failed",
      error:
        err instanceof Error
          ? err.message
          : "UNKNOWN_ERROR",
    };
  }
}
