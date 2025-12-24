import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS, type Plan } from "@/lib/plans";
import { getComplianceRisk } from "@/lib/compliance";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
    const planKey: Plan =
      rawPlan === "starter" ||
      rawPlan === "business" ||
      rawPlan === "agency"
        ? (rawPlan as Plan)
        : "free";
    const { searchParams } = new URL(req.url);
    let includeReports = searchParams.get("reports") !== null;
    const includeAudit = searchParams.get("audit") !== null;
    const scanIdFilter = searchParams.get("scanId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const websiteFilter = searchParams.get("website");

    // Backwards compatibility: no query params means "reports only"
    if (!includeReports && !includeAudit) {
      includeReports = true;
    }

    if (includeAudit && !PLANS[planKey].auditTrail) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          reason:
            "Audit trail exports are available on Business and Agency plans.",
        },
        { status: 403 }
      );
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
    if (fromParam) {
      const d = new Date(fromParam);
      if (!Number.isNaN(d.getTime())) {
        createdAtFilter.gte = d;
      }
    }
    if (toParam) {
      const d = new Date(toParam);
      if (!Number.isNaN(d.getTime())) {
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);
        createdAtFilter.lte = endOfDay;
      }
    }

    if (includeReports) {
      const scans = await prisma.scanJob.findMany({
        where: {
          userId: user.id,
          ...(scanIdFilter
            ? {
                id: scanIdFilter,
              }
            : {}),
          ...(Object.keys(createdAtFilter).length
            ? { createdAt: createdAtFilter }
            : {}),
          ...(websiteFilter
            ? {
                website: {
                  url: {
                    contains: websiteFilter,
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

    if (includeAudit) {
      const alerts = await prisma.complianceAlert.findMany({
        where: {
          userId: user.id,
          ...(scanIdFilter
            ? {
                scanJobId: scanIdFilter,
              }
            : {}),
          ...(Object.keys(createdAtFilter).length
            ? {
                scanJob: {
                  createdAt: createdAtFilter,
                },
              }
            : {}),
          ...(websiteFilter
            ? {
                scanJob: {
                  website: {
                    url: {
                      contains: websiteFilter,
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
          alert.delta != null && alert.delta !== 0
            ? `${alert.delta > 0 ? "+" : ""}${alert.delta}`
            : "0";

        rows.push([
          "Alert",
          alert.scanJob?.id ?? "",
          alert.scanJob?.website?.url ?? "",
          prettyStatus,
          alert.scanJob?.score != null
            ? `${alert.scanJob.score}/100`
            : "—",
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
          alert.previousScore != null
            ? `${alert.previousScore}/100`
            : "—",
          alert.currentScore != null
            ? `${alert.currentScore}/100`
            : "—",
          scoreChange,
          alert.severity.replace(/^./, (c) => c.toUpperCase()),
          new Date(alert.createdAt).toISOString(),
          alert.acknowledged ? "Yes" : "No",
        ]);
      }
    }

    const csvLines = [header, ...rows]
      .map((cols) =>
        cols
          .map((value) => {
            const str = String(value ?? "");
            if (str.includes(",") || str.includes("\"")) {
              return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
          })
          .join(",")
      )
      .join("\n");

    const filename = `compliance-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(csvLines, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("REPORT_EXPORT_FAILED", error);
    return NextResponse.json(
      { error: "EXPORT_FAILED" },
      { status: 500 }
    );
  }
}
