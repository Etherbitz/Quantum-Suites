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

    const adminUser = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    if (adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "FORBIDDEN", reason: "Admin access required" },
        { status: 403 }
      );
    }

    const rawPlan =
      typeof adminUser.plan === "string" ? adminUser.plan.toLowerCase() : "free";
    const planKey: Plan =
      rawPlan === "starter" || rawPlan === "business" || rawPlan === "agency"
        ? (rawPlan as Plan)
        : "free";

    const canAudit = !!PLANS[planKey].auditTrail;

    const { searchParams } = new URL(req.url);
    const scanIdFilter = searchParams.get("scanId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const websiteFilter = searchParams.get("website");
    const ownerFilter = searchParams.get("owner");

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

    const scans = await prisma.scanJob.findMany({
      where: {
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
        ...(ownerFilter
          ? {
              user: {
                email: {
                  contains: ownerFilter,
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
        user: {
          select: { email: true },
        },
        website: {
          select: { url: true, nextScanAt: true },
        },
      },
    });

    const alerts = canAudit
      ? await prisma.complianceAlert.findMany({
          where: {
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
            ...(ownerFilter
              ? {
                  user: {
                    email: {
                      contains: ownerFilter,
                      mode: "insensitive",
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
            user: {
              select: { email: true },
            },
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
        })
      : [];

    const totalScans = scans.length;
    const fromDate = scans[scans.length - 1]?.createdAt ?? null;
    const toDate = scans[0]?.createdAt ?? null;

    const latestScan = scans[0] ?? null;
    const latestScore = latestScan?.score ?? null;
    const latestRisk = getComplianceRisk(latestScore);

    let passFailLabel = "";
    if (typeof latestScore === "number") {
      if (latestScore >= 80) {
        passFailLabel = "Pass";
      } else if (latestScore < 50) {
        passFailLabel = "Fail";
      } else {
        passFailLabel = "Needs attention";
      }
    }

    const formatDate = (d: Date | string | null | undefined) => {
      if (!d) return "—";
      const date = typeof d === "string" ? new Date(d) : d;
      return date.toISOString();
    };

    const escapeHtml = (value: unknown) => {
      const str = String(value ?? "");
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const scanRowsHtml = scans
      .map((scan, index) => {
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

        const topIssues = Array.isArray(summary.topIssues)
          ? summary.topIssues
          : [];

        const riskLevel =
          risk.level && typeof risk.level === "string"
            ? risk.level.replace(/^./, (c) => c.toUpperCase())
            : "";

        const previousForWebsite = scans
          .slice(index + 1)
          .find((s) => s.website?.url === scan.website?.url);

        let scanNotes = `Baseline scan for ${scan.website?.url ?? "this website"}.`;

        if (
          previousForWebsite &&
          typeof scan.score === "number" &&
          typeof previousForWebsite.score === "number"
        ) {
          const delta = scan.score - previousForWebsite.score;

          if (delta > 0) {
            scanNotes = `Improved by +${delta} points since the previous scan on ${formatDate(
              previousForWebsite.createdAt
            )}.`;
          } else if (delta < 0) {
            scanNotes = `Dropped by ${Math.abs(
              delta
            )} points since the previous scan on ${formatDate(
              previousForWebsite.createdAt
            )}.`;
          } else {
            scanNotes = `Score unchanged since the previous scan on ${formatDate(
              previousForWebsite.createdAt
            )}.`;
          }
        }

        return `
          <tr>
            <td>Scan</td>
            <td>${escapeHtml(scan.id)}</td>
            <td>${escapeHtml(scan.website?.url ?? "")}</td>
            <td>${escapeHtml(scan.user?.email ?? "")}</td>
            <td>${escapeHtml(prettyStatus)}</td>
            <td>${
              scan.score != null
                ? escapeHtml(`${scan.score}/100`)
                : "&mdash;"
            }</td>
            <td>${escapeHtml(risk.label)}</td>
            <td>${escapeHtml(riskLevel)}</td>
            <td>${escapeHtml(prettyType)}</td>
            <td>${escapeHtml(automationEnabled)}</td>
            <td>${escapeHtml(scanNotes)}</td>
            <td>${escapeHtml(formatDate(scan.createdAt))}</td>
          </tr>`;
      })
      .join("");

    const alertsRowsHtml = alerts
      .map((alert) => {
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

        const topIssues = Array.isArray(summary.topIssues)
          ? summary.topIssues
          : [];

        const scoreChange =
          alert.delta != null && alert.delta !== 0
            ? `${alert.delta > 0 ? "+" : ""}${alert.delta}`
            : "0";

        const riskLevel =
          risk.level && typeof risk.level === "string"
            ? risk.level.replace(/^./, (c) => c.toUpperCase())
            : "";

        return `
          <tr>
            <td>Alert</td>
            <td>${escapeHtml(alert.scanJob?.id ?? "")}</td>
            <td>${escapeHtml(alert.scanJob?.website?.url ?? "")}</td>
            <td>${escapeHtml(alert.user?.email ?? "")}</td>
            <td>${escapeHtml(prettyStatus)}</td>
            <td>${
              alert.scanJob?.score != null
                ? escapeHtml(`${alert.scanJob.score}/100`)
                : "&mdash;"
            }</td>
            <td>${escapeHtml(risk.label)}</td>
            <td>${escapeHtml(riskLevel)}</td>
            <td>${escapeHtml(prettyType)}</td>
            <td>${escapeHtml(automationEnabled)}</td>
            <td>${escapeHtml(scoreChange)}</td>
            <td>${escapeHtml(alert.severity.replace(/^./, (c) => c.toUpperCase()))}</td>
            <td>${escapeHtml(formatDate(alert.createdAt))}</td>
            <td>${escapeHtml(alert.acknowledged ? "Yes" : "No")}</td>
          </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Admin Compliance Report</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e5e7eb; margin: 0; padding: 24px; }
      h1, h2, h3 { color: #f9fafb; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th, td { border: 1px solid #1f2937; padding: 6px 8px; text-align: left; }
      th { background: #030712; text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px; color: #9ca3af; }
      tbody tr:nth-child(even) { background: #020617; }
      tbody tr:nth-child(odd) { background: #020617; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 16px; }
      .card { border-radius: 12px; border: 1px solid #1f2937; padding: 12px 14px; background: #020617; }
      .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #6b7280; }
      .value { font-size: 20px; font-weight: 600; margin-top: 4px; }
      .muted { font-size: 11px; color: #9ca3af; }
      .section { margin-top: 32px; }
    </style>
  </head>
  <body>
    <header>
      <h1>Admin compliance report</h1>
      <p class="muted">Aggregated exports across all workspaces for Quantum Suites AI.</p>
      <div class="summary-grid">
        <div class="card">
          <div class="label">Total scans in export</div>
          <div class="value">${escapeHtml(totalScans)}</div>
        </div>
        <div class="card">
          <div class="label">Latest score</div>
          <div class="value">${
            typeof latestScore === "number"
              ? escapeHtml(`${latestScore}/100`)
              : "—"
          }</div>
        </div>
        <div class="card">
          <div class="label">Risk band</div>
          <div class="value">${escapeHtml(latestRisk.label)}</div>
          <p class="muted">${escapeHtml(latestRisk.level ?? "")}</p>
        </div>
        <div class="card">
          <div class="label">Pass / fail heuristic</div>
          <div class="value">${escapeHtml(passFailLabel || "N/A")}</div>
        </div>
        <div class="card">
          <div class="label">Date range</div>
          <div class="muted">From ${escapeHtml(formatDate(fromDate))}</div>
          <div class="muted">To ${escapeHtml(formatDate(toDate))}</div>
        </div>
      </div>
    </header>

    <section class="section">
      <h2>Scans</h2>
      <table>
        <thead>
          <tr>
            <th>Row type</th>
            <th>Scan ID</th>
            <th>Website</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Score</th>
            <th>Risk label</th>
            <th>Risk level</th>
            <th>Scan type</th>
            <th>Automation</th>
            <th>Notes</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>${scanRowsHtml}</tbody>
      </table>
    </section>

    <section class="section">
      <h2>Alerts</h2>
      <table>
        <thead>
          <tr>
            <th>Row type</th>
            <th>Scan ID</th>
            <th>Website</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Score</th>
            <th>Risk label</th>
            <th>Risk level</th>
            <th>Scan type</th>
            <th>Automation</th>
            <th>Score change</th>
            <th>Severity</th>
            <th>Created at</th>
            <th>Acknowledged</th>
          </tr>
        </thead>
        <tbody>${alertsRowsHtml}</tbody>
      </table>
    </section>
  </body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("ADMIN_HTML_EXPORT_FAILED", error);
    return NextResponse.json(
      { error: "EXPORT_FAILED" },
      { status: 500 }
    );
  }
}
