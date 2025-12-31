import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { FUNNEL_STAGES } from "@/lib/analytics/funnel";
import { getFunnelStats } from "@/lib/analytics/getFunnelStats";
import { getScanHealthStats } from "@/lib/analytics/getScanHealthStats";
import { FunnelRow } from "@/components/common/FunnelRow";
import { MetricCard } from "@/components/features/dashboard";

/**
 * Conversion analytics dashboard.
 */
export default async function AnalyticsDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, scanHealth] = await Promise.all([
    // Use last 30 days to keep analytics relevant to recent campaigns
    getFunnelStats("30d"),
    getScanHealthStats("7d"),
  ]);

  // Map funnel stages to high-level metrics
  const totalVisitors =
    stats.find((s) => s.stage === "cta_click")?.count ?? 0;
  const totalSignups =
    stats.find((s) => s.stage === "account_created")?.count ?? 0;
  const totalCustomers =
    stats.find((s) => s.stage === "subscription_started")?.count ?? 0;

  const signupRate =
    totalVisitors > 0
      ? Math.round((totalSignups / totalVisitors) * 100)
      : null;
  const customerRate =
    totalVisitors > 0
      ? Math.round((totalCustomers / totalVisitors) * 100)
      : null;

  return (
    <main className="px-6 py-8 text-neutral-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Analytics
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-50">
              Conversion analytics
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              See how visitors move from first touch to paid customer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
            <MetricCard
              label="Total visitors"
              value={totalVisitors.toString()}
            />
            <MetricCard
              label="Signup rate"
              value={
                signupRate !== null ? `${signupRate}%` : "—"
              }
              accent="amber"
            />
            <MetricCard
              label="Visit → customer"
              value={
                customerRate !== null
                  ? `${customerRate}%`
                  : "—"
              }
              accent="amber"
            />
          </div>
        </header>

        <section className="mt-2 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-50">
              Scan health
            </h2>
            <p className="text-[11px] text-neutral-500">
              Live queue depth and reliability over the last 7 days.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <MetricCard
              label="Queued scans"
              value={scanHealth.queued.toString()}
              accent={scanHealth.queued > 0 ? "amber" : "default"}
            />
            <MetricCard
              label="Running scans"
              value={scanHealth.running.toString()}
            />
            <MetricCard
              label="Success (7d)"
              value={scanHealth.completed.toString()}
            />
            <MetricCard
              label="Error rate (7d)"
              value={
                scanHealth.errorRate !== null
                  ? `${scanHealth.errorRate}%`
                  : "—"
              }
              accent={
                scanHealth.errorRate !== null &&
                scanHealth.errorRate >= 10
                  ? "danger"
                  : "default"
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <MetricCard
              label="Free — scans (7d)"
              value={
                (scanHealth.byPlan.free.completed +
                  scanHealth.byPlan.free.failed).toString()
              }
            />
            <MetricCard
              label="Starter — scans (7d)"
              value={
                (scanHealth.byPlan.starter.completed +
                  scanHealth.byPlan.starter.failed).toString()
              }
            />
            <MetricCard
              label="Business — scans (7d)"
              value={
                (scanHealth.byPlan.business.completed +
                  scanHealth.byPlan.business.failed).toString()
              }
            />
            <MetricCard
              label="Agency — scans (7d)"
              value={
                (scanHealth.byPlan.agency.completed +
                  scanHealth.byPlan.agency.failed).toString()
              }
            />
          </div>

          {scanHealth.oldestQueuedMinutes !== null && (
            <p className="mt-2 text-[11px] text-neutral-500">
              Oldest queued job has been waiting for approximately
              {" "}
              {scanHealth.oldestQueuedMinutes} minute
              {scanHealth.oldestQueuedMinutes === 1 ? "" : "s"}.
            </p>
          )}
        </section>

        <section className="mt-2 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-50">
              Funnel breakdown
            </h2>
            <p className="text-[11px] text-neutral-500">
              Stage-by-stage drop-off from your latest period.
            </p>
          </div>

          <div className="mt-2 space-y-3">
          {FUNNEL_STAGES.map((stage, index) => {
            const stat = stats.find(s => s.stage === stage.id);
            const previous = index === 0
              ? null
              : stats.find(s => s.stage === FUNNEL_STAGES[index - 1].id);

            const conversionRate =
              previous && previous.count > 0
                ? Math.round((stat!.count / previous.count) * 100)
                : null;

            return (
              <FunnelRow
                key={stage.id}
                label={stage.label}
                count={stat?.count ?? 0}
                conversionRate={conversionRate}
              />
            );
          })}
          </div>
        </section>
      </div>
    </main>
  );
}
