import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ComplianceScore } from "@/components/dashboard/ComplianceScore";
import ScanHistory from "@/components/dashboard/ScanHistory";
import { MetricCard, NextActionsStepper } from "@/components/features/dashboard";
import { ComplianceTrendChart } from "@/components/features/dashboard";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";
import SignupTracker from "@/components/analytics/SignupTracker";
import {
  calculateComplianceScore,
  getComplianceTrend,
} from "@/lib/compliance";
import { PLAN_ALERT_CONFIG } from "@/lib/alerts/planAlertConfig";
import { PLANS, type Plan } from "@/lib/plans";
import { hasFeature } from "@/lib/featureAccess";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { maybeCreateComplianceDropAlert } from "@/services/alertService";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  // Ensure we have a local user record tied to this Clerk user
  const user = await getOrCreateUser(userId, email);

  const rawPlan = (user.plan ?? "free").toLowerCase();
  const plan = (rawPlan in PLANS ? rawPlan : "free") as Plan;
  const planConfig = PLAN_ALERT_CONFIG[plan];

  // Fetch recent scans + websites
  const [scans, websites] = await Promise.all([
    prisma.scanJob.findMany({
      where: { userId: user.id },
      include: { website: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.website.findMany({
      where: { userId: user.id },
      select: { id: true, url: true, nextScanAt: true },
    }),
  ]);

  const currentPeriod = scans.slice(0, 10);
  const previousPeriod = scans.slice(10, 20);

  const currentScore = calculateComplianceScore(currentPeriod);
  const previousScore = calculateComplianceScore(previousPeriod);

  const trend = getComplianceTrend(currentScore, previousScore);

  const totalScans = scans.length;
  const highRiskCount = scans.filter((s) => (s.score ?? 0) < 60).length;
  const websitesLimit = PLANS[plan].websites;

  // Map website -> latest scan status for monitoring overview
  const websiteStatus = new Map<
    string,
    { lastScanAt: Date; lastScore: number | null; lastScanId: string }
  >();

  for (const scan of scans) {
    // First scan we encounter is the most recent due to ordering
    const websiteId = scan.websiteId;
    if (!websiteId || websiteStatus.has(websiteId)) continue;
    websiteStatus.set(websiteId, {
      lastScanAt: scan.createdAt,
      lastScore: scan.score ?? null,
      lastScanId: scan.id,
    });
  }

  // Determine if alerts are allowed by plan + scan type
  const latestScan = currentPeriod[0];
  const isScheduledScan = latestScan?.type === "scheduled";
  const alertsAllowed =
    planConfig.enabled &&
    (planConfig.mode === "realtime" ||
      (planConfig.mode === "scheduled_only" && isScheduledScan));

  // Resolve threshold (user override > plan default)
  const effectiveThreshold =
    user?.alertDropThreshold ?? planConfig.dropThreshold;

  if (alertsAllowed && latestScan) {
    await maybeCreateComplianceDropAlert({
      userId: user.id,
      plan,
      scanJobId: latestScan.id,
      previousScore,
      currentScore,
      dropThresholdOverride: effectiveThreshold,
    });
  }

  const latestSummary = latestScan?.summary as
    | { mode?: string; riskLevel?: string; topIssues?: string[]; reason?: string }
    | undefined
    | null;

  const topIssues = Array.isArray(latestSummary?.topIssues)
    ? latestSummary?.topIssues.slice(0, 3)
    : [];

  return (
    <div className="space-y-6">
      <SignupTracker />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-50">
            Compliance dashboard
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Your latest scans, overall score, and any recent risk changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
          <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 font-medium text-neutral-200">
            Plan: {plan}
          </span>
          <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1">
            Alerts: {alertsAllowed ? "enabled" : "off for this scan"}
          </span>
        </div>
      </div>

      {plan === "agency" && (
        <section className="rounded-2xl border border-emerald-700/40 bg-linear-to-br from-emerald-900/60 via-emerald-950 to-black p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Agency highlight
              </p>
              <h2 className="text-lg font-semibold text-emerald-50">
                AI Compliance Assistant for your client sites
              </h2>
              <p className="max-w-xl text-[11px] text-emerald-100/80">
                Turn raw scan findings into clear, developer-ready tasks. The assistant reads your latest
                results and suggests the exact fixes to ship next.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 text-[11px] md:items-end">
              <Link
                href={
                  latestScan?.id
                    ? `/scan/results?scanId=${latestScan.id}#ai-assistant`
                    : "/scan"
                }
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                {latestScan ? "Open AI assistant on latest scan" : "Run a scan to use AI"}
              </Link>
              <p className="text-[10px] text-emerald-200/80">
                Included on Agency — unlimited client websites.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Total scans"
          value={totalScans.toString()}
        />
        <MetricCard
          label="Portfolio score (all sites)"
          value={Number.isFinite(currentScore) ? `${currentScore}/100` : "—"}
          accent="amber"
        />
        <MetricCard
          label="High-risk scans"
          value={highRiskCount.toString()}
          accent={highRiskCount > 0 ? "danger" : "default"}
        />
      </div>

      {plan === "free" && (
        <p className="text-[11px] text-neutral-500">
          Upgrade to <span className="font-semibold text-neutral-200">Business</span> to monitor up to {PLANS.business.websites} sites continuously, receive change alerts, and unlock detailed reports.
        </p>
      )}

      {plan === "starter" && (
        <p className="text-[11px] text-neutral-500">
          On Starter you get weekly scans for one site. Move to <span className="font-semibold text-neutral-200">Business</span> for continuous monitoring, alerts, and AI-powered suggestions.
        </p>
      )}

      {plan === "business" && (
        <p className="text-[11px] text-neutral-500">
          Youre on <span className="font-semibold text-neutral-200">Business</span>. Add more key sites and keep an eye on drops in your Compliance Trend chart below.
        </p>
      )}

      {plan === "agency" && (
        <p className="text-[11px] text-neutral-500">
          Agency accounts can onboard unlimited client sites and centralize monitoring. Use this dashboard as your shared compliance cockpit.
        </p>
      )}

      {/* Top row: score + plan summary */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <ComplianceScore
          score={currentScore}
          trend={trend}
        />

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
            <h2 className="text-sm font-semibold text-neutral-50">
              Your plan
            </h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              {plan === "free"
                ? "Free — manual scans for one website."
                : plan === "starter"
                ? "Starter — weekly monitoring for a single site."
                : plan === "business"
                ? "Business — continuous monitoring, alerts, and reports."
                : "Agency — multi-site, white-label ready."}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Websites
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-50">
                  {websites.length}
                  {websitesLimit === Infinity ? " / ∞" : ` / ${websitesLimit}`}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Alerts
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-50">
                  {alertsAllowed ? "Enabled" : "Not active"}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Detailed reports
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-50">
                  {hasFeature(plan, "detailedReports") ? "Included" : "Locked"}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  AI suggestions
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-50">
                  {hasFeature(plan, "suggestions") ? "Included" : "Locked"}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  AI assistant
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-50">
                  {hasFeature(plan, "aiAssistant") ? "Included" : "Locked"}
                </p>
              </div>
            </div>

            {plan !== "business" && plan !== "agency" && (
              <div className="mt-3 text-[11px] text-neutral-400">
                <UpgradeCTA reason="Unlock continuous monitoring, alerts, and detailed reports on Business." />
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* Full-width next actions spanning both columns above */}
      <section className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-50">
            Next recommended actions
          </h2>
          <p className="text-[11px] text-neutral-500">
            Prioritized from your most recent scan
          </p>
        </div>

        {totalScans === 0 && (
          <p className="text-[11px] text-neutral-500">
            Run your first scan to see exactly where to start hardening
            your compliance posture.
          </p>
        )}

        {totalScans > 0 && topIssues.length === 0 && (
          <p className="text-[11px] text-neutral-500">
            No specific issues surfaced in your latest summary. Keep
            monitoring this score and schedule regular scans to catch
            regressions before they become incidents.
          </p>
        )}

        {topIssues.length > 0 && (
          plan === "business" || plan === "agency" ? (
            <NextActionsStepper
              issues={topIssues}
              plan={plan}
            />
          ) : (
            <p className="mt-2 text-[11px] text-amber-400">
              Upgrade to Business or Agency to get guided, step-by-step
              recommendations that walk you through fixing these issues.
            </p>
          )
        )}
      </section>

      {/* Recent scans below */}
      <section className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-50">
            Recent scans
          </h2>
          <div className="flex flex-col items-end gap-1 text-[11px] text-neutral-500">
            <p>
              Showing your last {currentPeriod.length || 0} scans
            </p>
            {latestScan && hasFeature(plan, "detailedReports") && (
              <a
                href={`/api/reports/export-html?scanId=${latestScan.id}`}
                className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800"
                title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
              >
                Export latest (HTML/PDF)
              </a>
            )}
          </div>
        </div>
        <ScanHistory scans={currentPeriod} />
      </section>

      {hasFeature(plan, "continuousMonitoring") && websites.length > 0 && (
        <ComplianceTrendChart
          websites={websites.map((w) => ({ id: w.id, url: w.url }))}
        />
      )}
    </div>
  );
}
