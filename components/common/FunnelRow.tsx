import { hasFeature } from "@/lib/featureAccess";
import type { Plan } from "@/lib/plans";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";

type PlanFeature = keyof typeof import("@/lib/plans").PLANS.free;

/**
 * Displays a single funnel stage row.
 */
export function FunnelRow({
  label,
  count,
  conversionRate,
  featureKey,
  user,
  reason,
}: {
  label: string;
  count: number;
  conversionRate: number | null;
  featureKey?: PlanFeature;
  user?: { plan: Plan };
  reason?: string;
}) {
  if (featureKey && user && hasFeature(user.plan, featureKey)) {
    return null;
  }

  if (featureKey && user && !hasFeature(user.plan, featureKey)) {
    return <UpgradeCTA reason={reason || `${label} is available on higher plans.`} />;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{count.toLocaleString()} users</p>
      </div>

      {conversionRate !== null && (
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-600">
            {conversionRate}%
          </p>
          <p className="text-xs text-gray-500">from previous</p>
        </div>
      )}
    </div>
  );
}
