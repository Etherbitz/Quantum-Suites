import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";
import { getComplianceRisk } from "@/lib/compliance";

interface DateRangeFilter {
  from?: string | null;
  to?: string | null;
}

interface ReportFilters extends DateRangeFilter {
  scanId?: string | null;
  website?: string | null;
}

export async function buildCsvReport(options: {
  userId: string;
  plan: Plan;
  includeReports: boolean;
  includeAudit: boolean;
  filters: ReportFilters;
}) {
  const { userId, plan, includeReports, includeAudit, filters } = options;

  if (options.includeAudit && !PLANS[plan].auditTrail) {
    throw new Error("AUDIT_NOT_ALLOWED");
  }

  const header = [
    "Row",
    "Scan ID",
    "Website",
    "Status",
    "Score",
    "Risk Label",
    "Risk Level",
    "Scan Type",
    "Automation Enabled",
    "Top Issues (most important first)",
    "Scan Created At",
    "Previous Score",
    "Current Score",
    "Score Change",
    "Alert Severity",
    "Alert Created At",
    "Alert Acknowledged",
  ];

  const rows: string[][] = [];

  const createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (filters.from) {
    const d = new Date(filters.from);
    if (!Number.isNaN(d.getTime())) {
      createdAtFilter.gte = d;
    }
  }
  if (filters.to) {
    const d = new Date(filters.to);
    if (!Number.isNaN(d.getTime())) {
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      createdAtFilter.lte = endOfDay;
    }
  }

  if (includeReports) {
    const scans = await prisma.scanJob.findMany({
      where: {
        userId,
        ...(filters.scanId ? { id: filters.scanId } : {}),
        ...(Object.keys(createdAtFilter).length
          ? { createdAt: createdAtFilter }
          : {}),
        ...(filters.website
          ? {
              website: {
                url: {
                  contains: filters.website,
                  mode: "insensitive",
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        score: true,
        type: true,
        summary: true,
        createdAt: true,
        website: {
          select: { url: true, nextScanAt: true },
        },
      },
    });

    for (const scan of scans) {
      const risk = getComplianceRisk(scan.score);
      const summary = (scan.summary ?? {}) as {
        riskLevel?: string;
        topIssues?: string[];
      };

      const prettyStatus = String(scan.status)
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase());

      const prettyType =
        scan.type === "scheduled"
          ? "Scheduled (auto)"
          : scan.type === "anonymous"
          ? "Anonymous"
          : "Manual";

      const automationEnabled = scan.website?.nextScanAt ? "Yes" : "No";

      const topIssuesText = Array.isArray(summary.topIssues)
        ? summary.topIssues.join(" | ")
        : "";

      rows.push([
        "Scan",
        scan.id,
        scan.website?.url ?? "",
        prettyStatus,
        scan.score != null ? `${scan.score}/100` : "—",
        risk.label,
        risk.level
          ? risk.level.replace(/^./, (c) => c.toUpperCase())
          : "",
        prettyType,
        automationEnabled,
        topIssuesText,
        new Date(scan.createdAt).toISOString(),
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
    }
  }

  if (includeAudit && PLANS[plan].auditTrail) {
    const alerts = await prisma.complianceAlert.findMany({
      where: {
        userId,
        ...(filters.scanId
          ? {
              scanJobId: filters.scanId,
            }
          : {}),
        ...(Object.keys(createdAtFilter).length
          ? {
              scanJob: {
                createdAt: createdAtFilter,
              },
            }
          : {}),
        ...(filters.website
          ? {
              scanJob: {
                website: {
                  url: {
                    contains: filters.website,
                    mode: "insensitive",
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        previousScore: true,
        currentScore: true,
        delta: true,
        severity: true,
        acknowledged: true,
        createdAt: true,
        scanJob: {
          select: {
            id: true,
            status: true,
            score: true,
            type: true,
            summary: true,
            createdAt: true,
            website: { select: { url: true, nextScanAt: true } },
          },
        },
      },
    });

    for (const alert of alerts) {
      const baseScore = alert.currentScore ?? alert.scanJob?.score;
      const risk = getComplianceRisk(baseScore);
      const summary = (alert.scanJob?.summary ?? {}) as {
        riskLevel?: string;
        topIssues?: string[];
      };

      const prettyStatus = String(alert.scanJob?.status ?? "")
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase());

      const prettyType =
        alert.scanJob?.type === "scheduled"
          ? "Scheduled (auto)"
          : alert.scanJob?.type === "anonymous"
          ? "Anonymous"
          : "Manual";

      const automationEnabled = alert.scanJob?.website?.nextScanAt
        ? "Yes"
        : "No";

      const topIssuesText = Array.isArray(summary.topIssues)
        ? summary.topIssues.join(" | ")
        : "";

      const scoreChange =
        alert.previousScore != null && alert.currentScore != null
          ? alert.currentScore - alert.previousScore
          : alert.delta;

      rows.push([
        "Alert",
        alert.scanJob?.id ?? "",
        alert.scanJob?.website?.url ?? "",
        prettyStatus,
        baseScore != null ? `${baseScore}/100` : "—",
        risk.label,
        risk.level
          ? risk.level.replace(/^./, (c) => c.toUpperCase())
          : "",
        prettyType,
        automationEnabled,
        topIssuesText,
        alert.scanJob?.createdAt
          ? new Date(alert.scanJob.createdAt).toISOString()
          : "",
        alert.previousScore != null ? `${alert.previousScore}/100` : "—",
        alert.currentScore != null ? `${alert.currentScore}/100` : "—",
        scoreChange != null ? String(scoreChange) : "",
        alert.severity,
        new Date(alert.createdAt).toISOString(),
        alert.acknowledged ? "Yes" : "No",
      ]);
    }
  }

  const csvLines = [header, ...rows].map((row) =>
    row
      .map((value) => {
        const safe = value ?? "";
        return /[",\n]/.test(safe)
          ? `"${String(safe).replace(/"/g, '""')}"`
          : safe;
      })
      .join(",")
  );

  return csvLines.join("\n");
}
