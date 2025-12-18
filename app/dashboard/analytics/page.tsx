import { FUNNEL_STAGES } from "@/lib/analytics/funnel";
import { getFunnelStats } from "@/lib/analytics/getFunnelStats";
import { FunnelRow } from "@/components/FunnelRow";

/**
 * Conversion analytics dashboard.
 */
export default async function AnalyticsDashboardPage() {
  const stats = await getFunnelStats();

  return (
    <main className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold text-gray-900">
          Conversion Analytics
        </h1>

        <p className="mt-2 text-gray-700">
          Track how users move from interest to revenue.
        </p>

        <div className="mt-10 space-y-4">
          {FUNNEL_STAGES.map((stage, index) => {
            const stat = stats.find(s => s.stage === stage.id);
            const previous = index === 0
              ? null
              : stats.find(s => s.stage === FUNNEL_STAGES[index - 1].id);

            const conversionRate =
              previous && previous.count > 0
                ? Math.round((stat!.count / previous.count) * 100)
                : null;

            return (
              <FunnelRow
                key={stage.id}
                label={stage.label}
                count={stat?.count ?? 0}
                conversionRate={conversionRate}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
