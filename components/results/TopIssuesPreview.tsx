"use client";

import Link from "next/link";

type PreviewMode = "anon" | "free" | "paid";

type PreviewIssue = {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  summary?: string;
};

function normalizeIssues(results: any): PreviewIssue[] {
  const raw: any[] = Array.isArray(results)
    ? results
    : Array.isArray(results?.issues)
    ? results.issues
    : [];

  return raw.map((issue, index): PreviewIssue => {
    const sev = String(issue?.severity ?? "info").toLowerCase();
    const severity: PreviewIssue["severity"] =
      sev === "critical" || sev === "warning" ? (sev as any) : "info";

    const category =
      typeof issue?.category === "string" && issue.category.length > 0
        ? issue.category
        : "Other";

    const title =
      typeof issue?.title === "string" && issue.title.length > 0
        ? issue.title
        : typeof issue?.message === "string" && issue.message.length > 0
        ? issue.message
        : "Issue";

    const summary =
      typeof issue?.description === "string" && issue.description.length > 0
        ? issue.description
        : typeof issue?.message === "string" && issue.message.length > 0
        ? issue.message
        : undefined;

    const id =
      typeof issue?.id === "string" && issue.id.length > 0
        ? issue.id
        : typeof issue?.regulationCode === "string" &&
          issue.regulationCode.length > 0
        ? issue.regulationCode
        : `issue-${index}`;

    return {
      id,
      severity,
      category,
      title,
      summary,
    };
  });
}

function sortIssues(issues: PreviewIssue[]): PreviewIssue[] {
  const severityRank: Record<PreviewIssue["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...issues].sort((a, b) => {
    const rankDiff = severityRank[a.severity] - severityRank[b.severity];
    if (rankDiff !== 0) return rankDiff;
    return a.title.localeCompare(b.title);
  });
}

export function TopIssuesPreview({
  results,
  mode,
}: {
  results: any;
  mode: PreviewMode;
}) {
  const allIssues = sortIssues(normalizeIssues(results));

  if (!allIssues.length) {
    return null;
  }

  const limit = mode === "anon" ? 3 : mode === "free" ? 6 : allIssues.length;
  const visible = allIssues.slice(0, limit);
  const hiddenCount = allIssues.length - visible.length;

  const heading =
    mode === "anon"
      ? "Top issues spotted in your quick check"
      : mode === "free"
      ? "Top issues from your basic scan"
      : "Key issues";

  const subtitle =
    mode === "anon"
      ? "Create a free account to see more issues and keep this scan on file."
      : mode === "free"
      ? "Upgrade to unlock full technical details, all remaining issues, and automation."
      : "Review the most important findings from this scan.";

  return (
    <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-50">
            {heading}
          </h2>
          <p className="text-[11px] text-neutral-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-2 space-y-3 text-sm">
        {visible.map((issue) => {
          const sevClasses =
            issue.severity === "critical"
              ? "bg-red-500/15 text-red-200 border-red-500/50"
              : issue.severity === "warning"
              ? "bg-yellow-400/15 text-yellow-100 border-yellow-400/40"
              : "bg-sky-500/10 text-sky-100 border-sky-500/40";

          return (
            <div
              key={issue.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {issue.category}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-neutral-50">
                    {issue.title}
                  </h3>
                </div>
                <span
                  className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sevClasses}`}
                >
                  {issue.severity.toUpperCase()}
                </span>
              </div>

              {issue.summary && (
                <p className="mt-2 line-clamp-2 text-xs text-neutral-300">
                  {issue.summary}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-neutral-800 pt-3 text-[11px] text-neutral-400">
          <p>
            +{hiddenCount} more issue{hiddenCount === 1 ? "" : "s"} not shown
            here.
          </p>

          {mode === "anon" ? (
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/20"
            >
              Create free account
            </Link>
          ) : mode === "free" ? (
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-200 hover:border-sky-400 hover:bg-sky-500/20"
            >
              Upgrade to see all
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}
