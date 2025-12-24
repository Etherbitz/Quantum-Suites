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

    const canAudit = !!PLANS[planKey].auditTrail;

    const { searchParams } = new URL(req.url);
    const scanIdFilter = searchParams.get("scanId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const websiteFilter = searchParams.get("website");

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
        createdAtFilter.lte = d;
      }
    }

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

    const alerts = canAudit
      ? await prisma.complianceAlert.findMany({
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
        })
      : [];

    const totalScans = scans.length;
    const fromDate = scans[scans.length - 1]?.createdAt ?? null;
    const toDate = scans[0]?.createdAt ?? null;

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
      .map((scan) => {
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

        return `
          <tr>
            <td>Scan</td>
            <td>${escapeHtml(scan.id)}</td>
            <td>${escapeHtml(scan.website?.url ?? "")}</td>
            <td>${escapeHtml(prettyStatus)}</td>
            <td>${scan.score != null ? escapeHtml(`${scan.score}/100`) : "&mdash;"}</td>
            <td>${escapeHtml(risk.label)}</td>
            <td>${escapeHtml(riskLevel)}</td>
            <td>${escapeHtml(prettyType)}</td>
            <td>${escapeHtml(automationEnabled)}</td>
            <td>
              ${
                topIssues.length
                  ? `<ul>${topIssues
                      .map((issue) => `<li>${escapeHtml(issue)}</li>`)
                      .join("")}</ul>`
                  : "&mdash;"
              }
            </td>
            <td>${escapeHtml(formatDate(scan.createdAt))}</td>
          </tr>
        `;
      })
      .join("");

    const alertRowsHtml = alerts
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

        const riskLevel =
          risk.level && typeof risk.level === "string"
            ? risk.level.replace(/^./, (c) => c.toUpperCase())
            : "";

        const scoreChange =
          alert.delta != null && alert.delta !== 0
            ? `${alert.delta > 0 ? "+" : ""}${alert.delta}`
            : "0";

        return `
          <tr>
            <td>Alert</td>
            <td>${escapeHtml(alert.scanJob?.id ?? "")}</td>
            <td>${escapeHtml(alert.scanJob?.website?.url ?? "")}</td>
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
            <td>
              ${
                topIssues.length
                  ? `<ul>${topIssues
                      .map((issue) => `<li>${escapeHtml(issue)}</li>`)
                      .join("")}</ul>`
                  : "&mdash;"
              }
            </td>
            <td>${escapeHtml(formatDate(alert.scanJob?.createdAt ?? null))}</td>
            <td>${
              alert.previousScore != null
                ? escapeHtml(`${alert.previousScore}/100`)
                : "&mdash;"
            }</td>
            <td>${
              alert.currentScore != null
                ? escapeHtml(`${alert.currentScore}/100`)
                : "&mdash;"
            }</td>
            <td>${escapeHtml(scoreChange)}</td>
            <td>${escapeHtml(
              alert.severity.replace(/^./, (c) => c.toUpperCase())
            )}</td>
            <td>${escapeHtml(formatDate(alert.createdAt))}</td>
            <td>${alert.acknowledged ? "Yes" : "No"}</td>
          </tr>
        `;
      })
      .join("");

    const filename = `compliance-report-${new Date()
      .toISOString()
      .slice(0, 10)}.html`;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Quantum Suites AI – Compliance report</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 32px; color: #0b1120; background: #020617; }
      h1 { font-size: 26px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
      p { font-size: 13px; margin: 2px 0; }
      table { border-collapse: collapse; width: 100%; margin-top: 8px; font-size: 12px; }
      thead { background: #020617; color: #e5e7eb; }
      th, td { border: 1px solid #1f2937; padding: 6px 8px; vertical-align: top; }
      th { text-align: left; font-weight: 600; }
      ul { margin: 0; padding-left: 18px; }
      .muted { color: #9ca3af; }
      .brand-shell { border-radius: 16px; border: 1px solid #1f2937; background: #020617; padding: 20px 24px; margin-bottom: 20px; }
      .brand-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 999px; background: #0f172a; color: #e5e7eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; }
      .brand-dot { width: 6px; height: 6px; border-radius: 999px; background: #22c55e; }
      .brand-title { font-size: 22px; font-weight: 600; color: #e5e7eb; margin-top: 8px; }
      .brand-subtitle { font-size: 13px; color: #9ca3af; margin-top: 2px; }
      .section-card { border-radius: 16px; border: 1px solid #1f2937; background: #020617; padding: 16px 20px; margin-top: 16px; }
      .section-heading { font-size: 13px; text-transform: uppercase; letter-spacing: 0.16em; color: #9ca3af; margin-bottom: 6px; }
    </style>
  </head>
  <body>
    <div class="brand-shell">
      <div class="brand-badge">
        <span class="brand-dot"></span>
        <span>Quantum Suites AI</span>
      </div>
      <div class="brand-title">Compliance report</div>
      <p class="brand-subtitle">Snapshot of your accessibility, privacy, and security posture.</p>
      <p class="muted">Account: ${escapeHtml(user.email)}</p>
      <p class="muted">Plan: ${escapeHtml(planKey)}</p>
      <p class="muted">Scans: ${totalScans} ${
        fromDate && toDate
          ? `(from ${escapeHtml(formatDate(fromDate))} to ${escapeHtml(
              formatDate(toDate)
            )})`
          : ""
      }</p>
      <p class="muted">Generated at: ${escapeHtml(formatDate(new Date()))}</p>
    </div>

    <div class="section-card">
      <div class="section-heading">Scan history</div>
      <table>
      <thead>
        <tr>
          <th>Row</th>
          <th>Scan ID</th>
          <th>Website</th>
          <th>Status</th>
          <th>Score</th>
          <th>Risk label</th>
          <th>Risk level</th>
          <th>Scan type</th>
          <th>Automation</th>
          <th>Top issues</th>
          <th>Scan created at</th>
        </tr>
      </thead>
      <tbody>
        ${scanRowsHtml || `<tr><td colspan="11" class="muted">No scans found.</td></tr>`}
      </tbody>
      </table>
    </div>

    <div class="section-card">
      <div class="section-heading">Score change alerts</div>
      <p class="muted">Only available on Business and Agency plans.</p>
      <table>
      <thead>
        <tr>
          <th>Row</th>
          <th>Scan ID</th>
          <th>Website</th>
          <th>Status</th>
          <th>Score</th>
          <th>Risk label</th>
          <th>Risk level</th>
          <th>Scan type</th>
          <th>Automation</th>
          <th>Top issues</th>
          <th>Scan created at</th>
          <th>Previous score</th>
          <th>Current score</th>
          <th>Score change</th>
          <th>Alert severity</th>
          <th>Alert created at</th>
          <th>Alert acknowledged</th>
        </tr>
      </thead>
      <tbody>
        ${
          canAudit
            ? alertRowsHtml ||
              `<tr><td colspan="17" class="muted">No alerts found.</td></tr>`
            : `<tr><td colspan="17" class="muted">Upgrade to Business or Agency to unlock detailed alert history exports.</td></tr>`
        }
      </tbody>
      </table>
    </div>
  </body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("REPORT_HTML_EXPORT_FAILED", error);
    return NextResponse.json(
      { error: "EXPORT_FAILED" },
      { status: 500 }
    );
  }
}
