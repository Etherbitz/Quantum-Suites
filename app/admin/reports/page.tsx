import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";
import { MetricCard } from "@/components/features/dashboard";
import { AdminScanActions } from "@/components/admin";

interface AdminReportsPageProps {
  searchParams?: {
    from?: string;
    to?: string;
    website?: string;
    owner?: string;
  };
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const adminUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const planKey = (adminUser.plan in PLANS ? adminUser.plan : "free") as Plan;
  const canExportAuditTrail = !!PLANS[planKey].auditTrail;

  const fromParam = searchParams?.from ?? "";
  const toParam = searchParams?.to ?? "";
  const websiteFilter = searchParams?.website ?? "";
  const ownerFilter = searchParams?.owner ?? "";

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
      createdAt: true,
      user: {
        select: { email: true },
      },
      website: {
        select: {
          url: true,
        },
      },
    },
    take: 500,
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
            Admin reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-50">
            All scans & exports
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Search across every workspace, then export CSV or HTML reports for audits and internal reviews.
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
              <label className="flex items-center gap-1">
                <span className="text-neutral-500">Owner</span>
                <input
                  type="text"
                  name="owner"
                  placeholder="user@domain.com"
                  defaultValue={ownerFilter}
                  className="h-7 w-40 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-[11px] text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none md:w-52"
                />
              </label>
              <button
                type="submit"
                className="rounded-md border border-neutral-700 px-3 py-1 text-[11px] font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-900"
              >
                Apply filters
              </button>
              {(fromParam || toParam || websiteFilter || ownerFilter) && (
                <Link
                  href="/admin/reports"
                  className="text-[11px] text-neutral-500 hover:text-neutral-300"
                >
                  Clear
                </Link>
              )}
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <form
                method="GET"
                action="/api/admin/reports/export"
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
                <input type="hidden" name="from" value={fromParam} />
                <input type="hidden" name="to" value={toParam} />
                <input
                  type="hidden"
                  name="website"
                  value={websiteFilter}
                />
                <input
                  type="hidden"
                  name="owner"
                  value={ownerFilter}
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-neutral-100 px-3 py-1.5 font-medium text-neutral-900 hover:bg-white"
                >
                  Download CSV
                </button>
              </form>
              <Link
                href={`/api/admin/reports/export-html?${new URLSearchParams({
                  ...(fromParam ? { from: fromParam } : {}),
                  ...(toParam ? { to: toParam } : {}),
                  ...(websiteFilter ? { website: websiteFilter } : {}),
                  ...(ownerFilter ? { owner: ownerFilter } : {}),
                }).toString()}`}
                className="inline-flex items-center rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
                title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
              >
                Download HTML report
              </Link>
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
            Showing up to 500 most recent scans matching your filters.
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

      <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Filtered scan jobs
          </p>
          <p className="text-[11px] text-neutral-500">
            Use bulk admin exports above for CSV/HTML, or per-scan actions here to open, export, or delete a scan.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-3 py-2">Website</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  className="border-t border-neutral-800 hover:bg-neutral-900"
                >
                  <td className="px-3 py-2 text-blue-300">
                    {scan.website?.url ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {scan.user?.email ?? "anonymous"}
                  </td>
                  <td className="px-3 py-2 uppercase">
                    {scan.status}
                  </td>
                  <td className="px-3 py-2">
                    {scan.score ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-400">
                    {scan.createdAt.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right align-middle">
                    <AdminScanActions
                      scanId={scan.id}
                      canAuditTrail={canExportAuditTrail}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
