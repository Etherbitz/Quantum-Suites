import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScanHistory } from "@/components/dashboard";
import { PLANS, type Plan } from "@/lib/plans";
import { MetricCard } from "@/components/dashboard";

export default async function ReportsPage() {
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

  // 🔒 Only fetch scans owned by this user
  const scans = await prisma.scanJob.findMany({
    where: { userId: user.id },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-50">
            Scan reports & audit trail
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Exportable history of every scan tied to your account.
          </p>
        </div>

        {canExportAuditTrail && (
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
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 font-medium text-neutral-50 hover:bg-blue-500"
            >
              Download CSV
            </button>
          </form>
        )}
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

      <ScanHistory scans={scans} showFilter />
    </div>
  );
}
