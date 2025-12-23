type Check = {
  id: string;
  status: "pass" | "fail" | "warn" | "info";
  title: string;
  detail?: string;
  fix?: string;
};

export function ResultsGrid({
  results,
}: {
  results: any;
}) {
  // Prefer explicit checks (partial scans), otherwise derive from issues arrays
  let checks: Check[] = Array.isArray(results?.checks)
    ? results.checks
    : [];

  if (!checks.length) {
    const issues: any[] = Array.isArray(results)
      ? results
      : Array.isArray(results?.issues)
      ? results.issues
      : [];

    checks = issues.map((issue) => {
      const severity = String(issue?.severity ?? "info").toLowerCase();

      const status: Check["status"] =
        severity === "critical"
          ? "fail"
          : severity === "warning"
          ? "warn"
          : "info";

      return {
        id:
          typeof issue?.id === "string" && issue.id.length > 0
            ? issue.id
            : typeof issue?.regulationCode === "string" &&
              issue.regulationCode.length > 0
            ? issue.regulationCode
            : String(issue?.title ?? "issue"),
        status,
        title: String(issue?.title ?? "Untitled issue"),
        detail:
          typeof issue?.description === "string" &&
          issue.description.length > 0
            ? issue.description
            : typeof issue?.message === "string" &&
              issue.message.length > 0
            ? issue.message
            : undefined,
        fix:
          typeof issue?.fix === "string" && issue.fix.length > 0
            ? issue.fix
            : undefined,
      } as Check;
    });
  }

  if (!checks.length) {
    return (
      <p className="text-sm text-neutral-400">
        No detailed issue list is available for this scan.
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5 shadow-lg">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">
          Detailed findings
        </h2>
        <p className="text-xs text-neutral-500">
          Prioritized list of accessibility, privacy, and security issues.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-50">
                {check.title}
              </h3>

              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  check.status === "pass"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                    : check.status === "fail"
                    ? "border-red-500/50 bg-red-500/20 text-red-100"
                    : check.status === "warn"
                    ? "border-yellow-400/40 bg-yellow-400/15 text-yellow-100"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-200"
                }`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>

            {check.detail && (
              <p className="mt-2 text-sm text-neutral-300">
                {check.detail}
              </p>
            )}

            {check.fix && (
              <p className="mt-2 text-sm text-neutral-400">
                <span className="font-semibold text-neutral-200">
                  Recommended fix:
                </span>{" "}
                {check.fix}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
