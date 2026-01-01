import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Plan } from "@/lib/plans";
import { hasFeature } from "@/lib/featureAccess";
import { WebsitesList } from "@/components/dashboard/WebsitesList";
import { UsageMeter } from "@/components/common/UsageMeter";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";
import { MonitoringToggle } from "@/components/settings/MonitoringToggle";

export const runtime = "nodejs";

export default async function WebsitesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      websites: {
        orderBy: { createdAt: "asc" },
      },
      scanJobs: {
        where: { websiteId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const rawPlan = (user.plan ?? "free").toLowerCase();
  const planKey: Plan =
    rawPlan === "starter" || rawPlan === "business" || rawPlan === "agency"
      ? (rawPlan as Plan)
      : "free";

  return (
    <div className="space-y-8">
      {/* Monitored sites */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Monitored websites</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Manage the sites you are actively monitoring for compliance and risk.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <WebsitesList
            websites={user.websites.map((site) => {
              const lastJob = user.scanJobs.find((job) => job.websiteId === site.id);

              return {
                id: site.id,
                url: site.url,
                nextScanAt: site.nextScanAt ? site.nextScanAt.toISOString() : null,
                lastScanAt: lastJob?.createdAt ? lastJob.createdAt.toISOString() : null,
                lastScore: lastJob?.score ?? null,
                lastScanId: lastJob?.id ?? null,
              };
            })}
            showExports
            canExport={hasFeature(planKey, "detailedReports")}
          />
        </div>
      </section>

      {/* Account & plan */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Account & plan</h2>
              <p className="mt-1 text-xs text-neutral-400">
                See how many websites your plan supports and upgrade if you need more capacity.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <UsageMeter />
          </div>
        </div>

        {/* Notifications & continuous monitoring */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Configure how and when you&apos;re notified about significant changes in your
              websites&apos; compliance score.
            </p>
            <div className="flex items-start justify-between gap-4 text-xs">
              <div>
                <p className="font-medium text-neutral-100">Change alerts</p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Immediate alerts when your score drops or new risks appear.
                </p>
              </div>
              {hasFeature(planKey, "changeAlerts") ? (
                <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Included in your plan
                </span>
              ) : (
                <div className="w-40 text-right">
                  <UpgradeCTA reason="Enable change alerts with a higher plan." />
                </div>
              )}
            </div>
            {hasFeature(planKey, "changeAlerts") && (
              <div className="pt-2 text-[11px] text-neutral-500">
                <a
                  href="/dashboard/alerts"
                  className="font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
                >
                  Open alert settings
                </a>
                <span className="ml-1">to fine-tune sensitivity.</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Continuous monitoring</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Automatically rescan your sites on a schedule so you don&apos;t have to
              remember.
            </p>

            {hasFeature(planKey, "continuousMonitoring") ? (
              <div className="space-y-3 text-xs text-neutral-300">
                <p>
                  Continuous monitoring is enabled for your plan. Use the toggle below to
                  turn scheduled scans on or off for all monitored sites.
                </p>
                <MonitoringToggle
                  plan={planKey}
                  websites={user.websites.map((site) => ({
                    id: site.id,
                    nextScanAt: site.nextScanAt
                      ? site.nextScanAt.toISOString()
                      : null,
                  }))}
                />
              </div>
            ) : (
              <UpgradeCTA reason="Upgrade to enable continuous monitoring." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
