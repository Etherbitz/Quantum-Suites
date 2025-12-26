import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";
import { PLAN_ALERT_CONFIG } from "@/lib/alerts/planAlertConfig";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";
import { AlertThresholdSetting } from "@/components/settings/AlertThresholdSetting";
import { AlertsTable } from "@/components/alerts/AlertsTable";

export const runtime = "nodejs";

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  const user = await getOrCreateUser(userId, email);

  const rawPlan = (user.plan ?? "free").toLowerCase();
  const planKey = (rawPlan in PLANS ? rawPlan : "free") as Plan;
  const plan = PLANS[planKey];
  const planAlerts = PLAN_ALERT_CONFIG[planKey];

  const alerts = await prisma.complianceAlert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      scanJob: {
        select: {
          id: true,
          website: { select: { url: true } },
        },
      },
    },
  });

  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalOpen = openAlerts.filter((a) => a.severity === "critical").length;
  const warningOpen = openAlerts.filter((a) => a.severity === "warning").length;
  const lastAlert = alerts[0] ?? null;

  const effectiveThreshold =
    user.alertDropThreshold ?? planAlerts.dropThreshold;

  const alertsEnabledByPlan = hasFeature(planKey, "changeAlerts");

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-neutral-800 bg-linear-to-r from-neutral-950 via-neutral-950 to-neutral-900 px-6 py-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Alerts
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">
              Compliance alerts & notifications
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              See every score drop in one place, fine-tune when alerts fire,
              and mark issues as resolved once you have taken action.
            </p>
          </div>

          <div className="grid gap-2 text-right text-[11px] text-neutral-400 md:text-xs">
            <div>
              <span className="font-semibold text-neutral-100">
                {openAlerts.length}
              </span>{" "}
              open alerts
            </div>
            <div>
              <span className="font-semibold text-red-300">
                {criticalOpen}
              </span>{" "}
              critical •
              <span className="ml-1 font-semibold text-amber-200">
                {warningOpen}
              </span>{" "}
              warnings
            </div>
            <div>
              Last alert:{" "}
              {lastAlert ? (
                <span className="font-semibold text-neutral-100">
                  {new Date(lastAlert.createdAt).toLocaleString()}
                </span>
              ) : (
                <span className="text-neutral-500">No alerts yet</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Alert policy
          </h2>
          <p className="text-xs text-neutral-400">
            Your plan controls how often we check for score drops and how
            sensitive alerts are by default. You can tighten the threshold
            below to catch smaller changes sooner.
          </p>
          <dl className="mt-2 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Plan</dt>
              <dd className="capitalize text-neutral-100">{planKey}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Alert mode</dt>
              <dd className="text-neutral-100">
                {planAlerts.enabled
                  ? planAlerts.mode === "realtime"
                    ? "Realtime for eligible scans"
                    : "On scheduled scans only"
                  : "Disabled for this plan"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Default drop threshold</dt>
              <dd className="text-neutral-100">
                {planAlerts.dropThreshold}%
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Cooldown window</dt>
              <dd className="text-neutral-100">
                Every {planAlerts.cooldownHours} hours per portfolio
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Alert sensitivity
          </h2>
          <p className="text-xs text-neutral-400">
            Decide how big a score drop should be before we create a new
            alert. This setting applies to your overall portfolio score.
          </p>

          {alertsEnabledByPlan ? (
            <AlertThresholdSetting initialValue={effectiveThreshold} min={1} max={50} />
          ) : (
            <div className="mt-2 text-xs">
              <UpgradeCTA reason="Upgrade to enable change alerts and adjust alert sensitivity." />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Alert history
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              A complete log of recent score-drop alerts. Use this to
              correlate changes in your website or content with shifts in
              compliance risk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <a
              href="/api/reports/export?audit=1"
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
            >
              <span>Export CSV</span>
            </a>
            <a
              href="/api/reports/export-html"
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
              title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
            >
              <span>Export HTML/PDF</span>
            </a>
          </div>
        </div>

        <AlertsTable
          alerts={alerts.map((alert) => ({
            id: alert.id,
            previousScore: alert.previousScore,
            currentScore: alert.currentScore,
            delta: alert.delta,
            severity: alert.severity as "warning" | "critical",
            acknowledged: alert.acknowledged,
            createdAt: alert.createdAt.toISOString(),
            scanJobId: alert.scanJob?.id ?? null,
            websiteUrl: alert.scanJob?.website?.url ?? null,
          }))}
        />
      </section>
    </div>
  );
}
