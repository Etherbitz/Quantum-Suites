import Link from "next/link";
import type { Plan } from "@/lib/plans";
import { getComplianceRisk } from "@/lib/compliance";

interface Props {
  scan: any;
  isPartial: boolean;
  plan: Plan;
  results: any;
  isAuthenticated?: boolean;
}

type AggregateRow = {
  category: string;
  total: number;
  critical: number;
  warning: number;
  info: number;
};

function aggregateIssues(results: any): AggregateRow[] {
  const raw: any[] = Array.isArray(results)
    ? results
    : Array.isArray(results?.issues)
    ? results.issues
    : [];

  const byCategory = new Map<string, AggregateRow>();

  for (const issue of raw) {
    const category =
      typeof issue?.category === "string" && issue.category.length > 0
        ? issue.category
        : "Other";
    const sev = String(issue?.severity || "info").toLowerCase();

    const current =
      byCategory.get(category) ??
      ({
        category,
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
      } as AggregateRow);

    current.total += 1;
    if (sev === "critical") current.critical += 1;
    else if (sev === "warning") current.warning += 1;
    else current.info += 1;

    byCategory.set(category, current);
  }

  return Array.from(byCategory.values()).sort(
    (a, b) => b.total - a.total
  );
}

function getPlanLabel(plan: Plan) {
  switch (plan) {
    case "free":
      return "Free";
    case "starter":
      return "Starter";
    case "business":
      return "Business";
    case "agency":
      return "Agency";
    default:
      return plan;
  }
}

export function ResultsSummary({
  scan,
  isPartial,
  plan,
  results,
  isAuthenticated,
}: Props) {
  const score = typeof scan.score === "number" ? scan.score : null;
  const risk = getComplianceRisk(score);
  const aggregates = !isPartial ? aggregateIssues(results) : [];
  const summary = scan.summary ?? {
    critical: aggregates.reduce((sum, row) => sum + row.critical, 0),
    warning: aggregates.reduce((sum, row) => sum + row.warning, 0),
    info: aggregates.reduce((sum, row) => sum + row.info, 0),
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-800 bg-linear-to-br from-neutral-950 via-neutral-950 to-neutral-900 p-5 shadow-lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-neutral-50">
              Scan summary
            </h2>
            {!isPartial && (
              <p className="mt-1 text-xs text-neutral-400">
                {summary.critical} critical, {summary.warning} warning, {summary.info} info findings detected.
              </p>
            )}
          </div>

          {isAuthenticated && (
            <Link
              href="/pricing"
              className="hidden rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-200 hover:border-blue-500 hover:text-blue-200 md:inline-flex"
            >
              You&apos;re on the {getPlanLabel(plan)} plan
            </Link>
          )}
        </div>

        {score !== null && (
          <div className="flex items-center gap-3 text-sm text-neutral-100">
            {(() => {
              const base =
                "rounded-full border px-3 py-1 text-xs font-semibold shadow-inner";
              const className =
                risk.level === "low"
                  ? `${base} border-emerald-500/40 bg-emerald-500/15 text-emerald-200`
                  : risk.level === "medium"
                  ? `${base} border-yellow-400/40 bg-yellow-400/15 text-yellow-100`
                  : risk.level === "high"
                  ? `${base} border-red-500/50 bg-red-500/20 text-red-100`
                  : `${base} border-neutral-600 bg-neutral-900 text-neutral-200`;

              return (
                <span className={className}>{risk.label}</span>
              );
            })()}

            <span className="text-neutral-400">
              Score: <span className="font-semibold text-neutral-100">{score}</span>
            </span>
          </div>
        )}
      </div>

      {isPartial && (
        <div className="mt-1 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-800">
            Limited scan completed
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            This site blocks automated crawling. We ran a
            network-level compliance check instead.
          </p>
        </div>
      )}

      {!isPartial && plan === "free" && aggregates.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 text-sm text-neutral-100">
          <p className="text-xs text-neutral-400">
            This free scan shows only a high-level overview of your risks.
            Upgrade to a paid plan to see full page-level details.
          </p>

          <div className="mt-3 space-y-2">
            {aggregates.map((row) => (
              <div
                key={row.category}
                className="flex items-center justify-between gap-4"
              >
                <span className="font-medium text-neutral-100">
                  {row.category}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                  <span className="font-semibold">
                    {row.total} issue{row.total === 1 ? "" : "s"}
                  </span>
                  <span className="text-red-300">
                    {row.critical} critical
                  </span>
                  <span className="text-yellow-300">
                    {row.warning} warning
                  </span>
                  <span className="text-neutral-400">
                    {row.info} info
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPartial && plan !== "free" && scan.summary?.topIssues?.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-neutral-100">
          {scan.summary.topIssues.map(
            (issue: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-neutral-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <span>{issue}</span>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  );
}
