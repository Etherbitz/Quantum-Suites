import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminMetrics } from "./data";
import {
  ScansOverTimeChart,
  ScoreDistributionChart,
} from "@/components/admin";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const metrics = await getAdminMetrics();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-white">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Admin Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Users", metrics.totalUsers],
          ["Scans", metrics.totalScans],
          ["Avg Score", metrics.avgScore],
          ["Active Schedules", metrics.activeSchedules],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
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
    </main>
  );
}
