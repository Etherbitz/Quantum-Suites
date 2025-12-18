import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import type { Plan } from "@/lib/plans";
import { UpgradeCTA } from "@/components/UpgradeCTA";
import { UsageMeter } from "@/components/UsageMeter";

/**
 * Settings page.
 */
export default async function SettingsPage() {
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
        Settings
      </h1>

      <div className="mt-6">
        <UsageMeter />
      </div>

      {user && hasFeature(user.plan as Plan, "continuousMonitoring") && (
        <div className="mt-6">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Enable Continuous Monitoring
          </label>
        </div>
      )}

      {user && !hasFeature(user.plan as Plan, "continuousMonitoring") && (
        <div className="mt-6">
          <UpgradeCTA reason="Continuous monitoring is available on Business plans." />
        </div>
      )}

      <p className="mt-4 text-gray-600">
        Account and notification settings will appear here.
      </p>
    </>
  );
}
