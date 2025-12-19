import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import type { Plan } from "@/lib/plans";
import { prisma } from "@/lib/db";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceScoreCard } from "@/components/dashboard/ComplianceScoreCard";
import { ScanHistory } from "@/components/dashboard/ScanHistory";
import { IssuesList } from "@/components/dashboard/IssuesList";
import Link from "next/link";

/**
 * Dashboard overview page.
 */
export default async function DashboardPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  let user = null;
  let scans: any[] = [];
  let latestScan: any = null;

  if (userId && clerkUser?.emailAddresses?.[0]?.emailAddress) {
    user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    // Fetch user's scans
    scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    latestScan = scans[0] || null;
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Parse issues from latest scan
  let issues: any[] = [];
  if (latestScan && latestScan.summaryIssues && Array.isArray(latestScan.summaryIssues)) {
    issues = latestScan.summaryIssues.map((msg: string, idx: number) => ({
      severity: idx < 2 ? "critical" : idx < 5 ? "warning" : "info",
      message: msg,
      category: "Accessibility",
    }));
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <Link
          href="/scan"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          New Scan
        </Link>
      </div>

      <section className="mt-6 grid gap-6 md:grid-cols-4">
        <MetricCard label="Websites" value={user?.websitesUsed.toString() || "0"} />
        <MetricCard
          label="Risk Level"
          value={latestScan?.riskLevel || "Unknown"}
          accent={latestScan?.riskLevel === "low" ? "green" : latestScan?.riskLevel === "medium" ? "amber" : "red"}
        />
        <MetricCard label="Issues" value={issues.length.toString()} />
        <MetricCard
          label="Last Scan"
          value={latestScan ? formatTimeAgo(new Date(latestScan.createdAt)) : "Never"}
        />
      </section>

      {latestScan ? (
        <>
          <section className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ComplianceScoreCard score={latestScan.score} riskLevel={latestScan.riskLevel} />
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detected Issues</h2>
              <IssuesList issues={issues} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan History</h2>
            <ScanHistory scans={scans} />
          </section>
        </>
      ) : (
        <section className="mt-10">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to Quantum Suites!
            </h2>
            <p className="text-gray-600 mb-6">
              Start by scanning your website to see your compliance score and identify potential issues.
            </p>
            <Link
              href="/scan"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Scan Your Website
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
