import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScanHistory } from "@/components/dashboard";
import { PLANS, type Plan } from "@/lib/plans";
import { MetricCard } from "@/components/dashboard";

interface ReportsPageProps {
  searchParams?: {
    from?: string;
    to?: string;
    website?: string;
  };
}

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const planKey = (user.plan in PLANS ? user.plan : "free") as Plan;
  const canExportAuditTrail = !!PLANS[planKey].auditTrail;

  const fromParam = searchParams?.from ?? "";
  const toParam = searchParams?.to ?? "";
  const websiteFilter = searchParams?.website ?? "";

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

  // 🔒 Only fetch scans owned by this user
  const scans = await prisma.scanJob.findMany({
    where: {
      userId: user.id,
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
      createdAt: true,
      website: {
        select: {
          url: true,
        },
      },
    },
  });

  const totalScans = scans.length;
  const completedScans = scans.filter(
    (s) => s.status.toLowerCase() === "completed"
  ).length;
  const avgScore = Math.round(
    scans.reduce((acc, s) => acc + (s.score ?? 0), 0) /
      (totalScans || 1)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-50">
            Scan reports & audit trail
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            High-level view of your scan activity, plus exportable reports you can share with stakeholders.
          </p>
        </div>

        {canExportAuditTrail && (
          <div className="flex flex-col items-end gap-3 text-[11px] text-neutral-400">
            <form
              method="GET"
              className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-neutral-400"
            >
              <label className="flex items-center gap-1">
                <span className="text-neutral-500">From</span>
                <input
                  type="date"
                  name="from"
                  defaultValue={fromParam}
                  className="h-7 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-[11px] text-neutral-100 focus:border-neutral-600 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-neutral-500">To</span>
                <input
                  type="date"
                  name="to"
                  defaultValue={toParam}
                  className="h-7 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-[11px] text-neutral-100 focus:border-neutral-600 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-neutral-500">Website</span>
                <input
                  type="text"
                  name="website"
                  placeholder="example.com"
                  defaultValue={websiteFilter}
                  className="h-7 w-32 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-[11px] text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none md:w-40"
                />
              </label>
              <button
                type="submit"
                className="rounded-md border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-900"
              >
                Apply filters
              </button>
              {(fromParam || toParam || websiteFilter) && (
                <a
                  href="/dashboard/reports"
                  className="text-[11px] text-neutral-500 hover:text-neutral-300"
                >
                  Clear
                </a>
              )}
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <form
                method="GET"
                action="/api/reports/export"
                className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
              >
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="reports"
                      value="1"
                      defaultChecked
                      className="h-3 w-3 rounded border-neutral-700 bg-neutral-950 text-blue-500"
                    />
                    <span>Reports</span>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="audit"
                      value="1"
                      className="h-3 w-3 rounded border-neutral-700 bg-neutral-950 text-blue-500"
                    />
                    <span>Audit trail</span>
                  </label>
                </div>
                <input
                  type="hidden"
                  name="from"
                  value={fromParam}
                />
                <input
                  type="hidden"
                  name="to"
                  value={toParam}
                />
                <input
                  type="hidden"
                  name="website"
                  value={websiteFilter}
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-neutral-100 px-3 py-1.5 font-medium text-neutral-900 hover:bg-white"
                >
                  Download CSV
                </button>
              </form>
              <a
                href={`/api/reports/export-html?${new URLSearchParams({
                  ...(fromParam ? { from: fromParam } : {}),
                  ...(toParam ? { to: toParam } : {}),
                  ...(websiteFilter ? { website: websiteFilter } : {}),
                }).toString()}`}
                className="inline-flex items-center rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
                title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
              >
                Download HTML report
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Summary
          </p>
          <p className="text-[11px] text-neutral-500">
            Use the buttons above for full-account exports, or the buttons on each scan card for single-scan reports.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard
            label="Total scans"
            value={totalScans.toString()}
          />
          <MetricCard
            label="Completed scans"
            value={completedScans.toString()}
            accent="amber"
          />
          <MetricCard
            label="Average score"
            value={Number.isFinite(avgScore) ? `${avgScore}/100` : "—"}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Scan history
          </p>
          <p className="text-[11px] text-neutral-500">
            Filter below, then download per-scan CSV or HTML as needed.
          </p>
        </div>
        <ScanHistory scans={scans} showFilter />
      </div>
    </div>
  );
}
