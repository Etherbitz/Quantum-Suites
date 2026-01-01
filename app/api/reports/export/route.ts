import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS, type Plan } from "@/lib/plans";
import { buildCsvReport } from "@/services/reportService";

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

    const canExportReports = Boolean(PLANS[planKey].detailedReports);

    if (!canExportReports) {
      return NextResponse.json(
        {
          error: "EXPORTS_LOCKED",
          reason: "Upgrade to Business or Agency to export reports.",
        },
        { status: 403 }
      );
    }

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

    const csv = await buildCsvReport({
      userId: user.id,
      plan: planKey,
      includeReports,
      includeAudit,
      filters: {
        scanId: scanIdFilter,
        from: fromParam,
        to: toParam,
        website: websiteFilter,
      },
    });

    const filename = `compliance-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(csv, {
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
