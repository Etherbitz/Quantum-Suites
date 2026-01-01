import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminMetrics } from "./data";
import { ScansOverTimeChart, ScoreDistributionChart } from "@/components/admin";
import { ClientDateTime } from "@/components/common/ClientDateTime";

function getTenureDays(createdAt: Date): number {
  return Math.max(
    1,
    Math.round(
      (Date.now() - createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, plan: true, email: true, createdAt: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [metrics, recentUsers, recentScans] = await Promise.all([
    getAdminMetrics(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.scanJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        score: true,
        createdAt: true,
        website: {
          select: { url: true },
        },
      },
    }),
  ]);

  const tenureDays = getTenureDays(user.createdAt);
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-white">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Admin overview
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Control center
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            High-level view of customers, scans, and platform health.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 font-medium text-neutral-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>
              {user.email} / {user.role} / {user.plan}
            </span>
          </span>
          <span>
            Admin since {user.createdAt.toLocaleDateString()} ({tenureDays} days)
          </span>
        </div>
      </header>

      <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Total customers", metrics.totalUsers],
            ["Total scans", metrics.totalScans],
            ["Avg. compliance score", `${metrics.avgScore}`],
            ["Active monitoring", metrics.activeSchedules],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-50">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* System & navigation summary */}
        <aside className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-xs text-neutral-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              System health
            </p>
            <p className="text-sm text-neutral-200">
              All core services are running normally.
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-neutral-400">
              <li>
                Database reachable, {metrics.totalUsers} users provisioned
              </li>
              <li>
                {metrics.totalScans} scans recorded across all workspaces
              </li>
              <li>
                {metrics.activeSchedules} websites with active monitoring
              </li>
            </ul>
          </div>

          <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-xs text-neutral-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Admin shortcuts
            </p>
            <div className="mt-1 flex flex-col gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[11px] font-medium text-neutral-100 hover:border-emerald-500 hover:text-emerald-200"
              >
                <span>Manage customers</span>
                <span className="text-[10px] text-neutral-500">
                  View accounts & tiers
                </span>
              </Link>
              <Link
                href="/admin/plans"
                className="inline-flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[11px] font-medium text-neutral-100 hover:border-sky-500 hover:text-sky-200"
              >
                <span>Plans & billing</span>
                <span className="text-[10px] text-neutral-500">
                  Tier mix & overrides
                </span>
              </Link>
              <Link
                href="/admin/logs"
                className="inline-flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[11px] font-medium text-neutral-100 hover:border-amber-500 hover:text-amber-200"
              >
                <span>Activity log</span>
                <span className="text-[10px] text-neutral-500">
                  Recent scans & events
                </span>
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* Charts & recent activity */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-medium">
              Scans over time
            </h2>
            <ScansOverTimeChart data={metrics.scansByDay} />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="mb-4 text-lg font-medium">
              Compliance score distribution
            </h2>
            <ScoreDistributionChart data={metrics.scoreBuckets} />
          </div>
        </div>

        <div className="space-y-4 text-xs text-neutral-200">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-neutral-50">
                  Latest scans
                </h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Most recent jobs across all websites.
                </p>
              </div>
              <Link
                href="/admin/logs"
                className="text-[11px] font-medium text-neutral-400 hover:text-neutral-100"
              >
                View all
              </Link>
            </div>

            {recentScans.length === 0 ? (
              <p className="text-[11px] text-neutral-500">
                No scans have been recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-900/80">
                {recentScans.map((scan) => (
                  <li
                    key={scan.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-neutral-100">
                        {scan.website?.url ?? "Unknown website"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-500">
                        <ClientDateTime value={scan.createdAt.toISOString()} />
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          scan.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                            : scan.status === "FAILED"
                            ? "bg-red-500/10 text-red-300 border border-red-500/40"
                            : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                        }`}
                      >
                        {scan.status.toLowerCase()}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-100">
                        {scan.score ?? "–"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-neutral-50">
                  Recent customers
                </h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Latest signups and their current tiers.
                </p>
              </div>
              <Link
                href="/admin/users"
                className="text-[11px] font-medium text-neutral-400 hover:text-neutral-100"
              >
                View all
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-[11px] text-neutral-500">
                No customers have signed up yet.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-900/80">
                {recentUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-neutral-100">
                        {u.email}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-500">
                        Joined {u.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium capitalize text-neutral-200">
                      {u.plan}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
