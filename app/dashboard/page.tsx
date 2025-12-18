import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import type { Plan } from "@/lib/plans";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceScore } from "@/components/dashboard/ComplianceScore";
import { ScanTable } from "@/components/dashboard/ScanTable";

/**
 * Dashboard overview page.
 */
export default async function DashboardPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  let user = null;
  if (userId && clerkUser?.emailAddresses?.[0]?.emailAddress) {
    user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-900">
        Dashboard
      </h1>

      <section className="mt-6 grid gap-6 md:grid-cols-4">
        <MetricCard label="Websites" value="1" />
        <MetricCard label="Risk Level" value="Medium" accent="amber" />
        <MetricCard label="Issues" value="7" />
        <MetricCard label="Last Scan" value="2h ago" />
        {user && hasFeature(user.plan as Plan, "changeAlerts") && (
          <MetricCard label="Change Alerts" value="Enabled" />
        )}
      </section>

      <section className="mt-10 grid gap-8 md:grid-cols-3">
        <ComplianceScore score={62} />

        <div className="md:col-span-2">
          <ScanTable />
        </div>
      </section>
    </>
  );
}
