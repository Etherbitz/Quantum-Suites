import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import { EmptyState } from "@/components/dashboard/EmptyState";

/**
 * Reports page.
 */
export default async function ReportsPage() {
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
        Reports
      </h1>

      <EmptyState
        title="No reports yet"
        description="Run your first scan to generate compliance reports."
      />

      {user && hasFeature(user.plan, "auditTrail") && (
        <div className="mt-6">
          <button className="rounded bg-blue-600 px-4 py-2 text-white">
            Download Audit Trail
          </button>
        </div>
      )}
    </>
  );
}
