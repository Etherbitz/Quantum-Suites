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
      "row_type",
      "scan_id",
      "website_url",
      "status",
      "score",
      "risk_label",
      "created_at",
      "previous_score",
      "current_score",
      "delta",
      "alert_severity",
      "alert_created_at",
      "acknowledged",
    ];

    const rows: string[][] = [];

    if (includeReports) {
      const scans = await prisma.scanJob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          score: true,
          createdAt: true,
          website: {
            select: { url: true },
          },
        },
      });

      for (const scan of scans) {
        const risk = getComplianceRisk(scan.score);
        rows.push([
          "scan",
          scan.id,
          scan.website?.url ?? "",
          String(scan.status),
          String(scan.score ?? ""),
          risk.label,
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
        where: { userId: user.id },
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
              createdAt: true,
              website: { select: { url: true } },
            },
          },
        },
      });

      for (const alert of alerts) {
        const risk = getComplianceRisk(alert.currentScore ?? alert.scanJob?.score);
        rows.push([
          "audit",
          alert.scanJob?.id ?? "",
          alert.scanJob?.website?.url ?? "",
          String(alert.scanJob?.status ?? ""),
          String(alert.scanJob?.score ?? ""),
          risk.label,
          alert.scanJob?.createdAt
            ? new Date(alert.scanJob.createdAt).toISOString()
            : "",
          String(alert.previousScore ?? ""),
          String(alert.currentScore ?? ""),
          String(alert.delta ?? ""),
          alert.severity,
          new Date(alert.createdAt).toISOString(),
          String(alert.acknowledged),
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
