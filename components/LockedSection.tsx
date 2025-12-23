import Link from "next/link";
import type { Plan } from "@/lib/plans";

/**
 * LockedSection
 *
 * Displays a gated CTA when detailed scan results are not available
 * for the current user/plan.
 */
export function LockedSection({
  scanId,
  isAuthenticated,
  plan,
}: {
  scanId: string;
  isAuthenticated?: boolean;
  plan?: Plan;
}) {
  const resolvedPlan: Plan = plan ?? "free";

  // Anonymous visitor: encourage account creation to see more
  if (!isAuthenticated) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Unlock Full Compliance Report
        </h2>

        <p className="mt-3 text-gray-600">
          Create a free account to save this scan and unlock
          ongoing monitoring and richer reporting for your site.
        </p>

        <Link
          href={`/sign-up?scanId=${scanId}`}
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Create Free Account
        </Link>
      </section>
    );
  }

  // Logged-in but on a plan without detailed reports
  return (
    <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-sm text-neutral-100">
      <h2 className="text-lg font-semibold text-neutral-50">
        Upgrade to see full issue details
      </h2>

      <p className="mt-2 text-neutral-300">
        Your current plan (&quot;{resolvedPlan}&quot;) shows only a summary. Upgrade to
        unlock line-by-line findings, fixes, and downloadable reports.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs text-neutral-200">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <h3 className="font-semibold text-neutral-50">Free</h3>
          <ul className="mt-2 space-y-1 text-neutral-400">
            <li>• Overall score & risk level</li>
            <li>• Issues by category & severity</li>
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <h3 className="font-semibold text-neutral-50">Starter</h3>
          <ul className="mt-2 space-y-1 text-neutral-400">
            <li>• Everything in Free</li>
            <li>• Clear summary of top issues</li>
            <li>• Weekly automated scans</li>
          </ul>
        </div>

        <div className="rounded-xl border border-blue-600 bg-neutral-900 p-3">
          <h3 className="font-semibold text-blue-200">Business</h3>
          <ul className="mt-2 space-y-1 text-neutral-300">
            <li>• Full issue list with fixes</li>
            <li>• AI-powered suggestions</li>
            <li>• Continuous monitoring & alerts</li>
            <li>• Downloadable audit trail</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-neutral-400">
          Choose the plan that matches how critical this site is to your
          business.
        </p>

        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          View plans & upgrade
        </Link>
      </div>
    </section>
  );
}
