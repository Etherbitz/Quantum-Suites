import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { LockedSection } from "@/components/LockedSection";
import { UsageMeter } from "@/components/UsageMeter";
import { PLANS } from "@/lib/plans";
import { hasFeature } from "@/lib/featureAccess";
import type { Plan } from "@/lib/plans";
import { UpgradeCTA } from "@/components/UpgradeCTA";


export default async function ScanResultsPage({
  searchParams,
}: {
  searchParams: { scanId?: string };
}) {
  if (!searchParams.scanId) {
    return <p>Missing scan ID</p>;
  }

  // -----------------------------
  // Auth & user resolution
  // -----------------------------
  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;

  let plan: Plan = "free";
  let dbUserId: string | null = null;

  if (userId && clerkUser?.emailAddresses?.[0]?.emailAddress) {
    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    plan = user.plan as typeof plan;
    dbUserId = user.id;
  }

  const showDetailedReport = PLANS[plan].detailedReports;

  // -----------------------------
  // Fetch scan
  // -----------------------------
  const scan = await prisma.scan.findUnique({
    where: { id: searchParams.scanId },
  });

  if (!scan) {
    return <p>Scan not found</p>;
  }

  // -----------------------------
  // Authorization (ownership)
  // -----------------------------
  const isOwner = dbUserId && scan.userId === dbUserId;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="space-y-6">
      <UsageMeter />

      {/* Public summary (always visible) */}
      <section>
        <h2 className="text-xl font-semibold">Scan Summary</h2>
        <ul className="list-disc pl-5">
      {scan.summaryIssues.map((issue, i) => (
    <li key={i}>{issue}</li>
        ))}
      </ul>
      </section>

      {/* Detailed report (plan-gated) */}
      {showDetailedReport && (
        <section>
          <h2 className="text-xl font-semibold">Detailed Report</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(scan.allIssues, null, 2)}</pre>
        </section>
      )}

      {/* AI Suggestions (plan-gated) */}
      {dbUserId && hasFeature(plan, "suggestions") ? (
        <section>
          <h2 className="text-xl font-semibold">AI Suggestions</h2>
          <p>Placeholder for AI suggestions panel.</p>
        </section>
      ) : dbUserId && (
        <UpgradeCTA reason="AI suggestions are available on Business plans." />
      )}

      {/* Locked details */}
      {!showDetailedReport && <LockedSection scanId={scan.id} />}

    </div>
  );
}
