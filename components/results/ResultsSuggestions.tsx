type RawResult = {
  id?: string;
  title?: string;
  message?: string;
  fix?: string;
  severity?: string;
  status?: string;
};

interface ResultsSuggestionsProps {
  results: any;
}

export function ResultsSuggestions({ results }: ResultsSuggestionsProps) {
  const rawItems: RawResult[] = Array.isArray(results?.issues)
    ? results.issues
    : Array.isArray(results?.checks)
    ? results.checks
    : [];

  const candidates = rawItems.filter((item) => {
    const severity = (item.severity || "").toLowerCase();
    const status = (item.status || "").toLowerCase();
    return (
      severity === "critical" ||
      severity === "warning" ||
      status === "fail" ||
      status === "warn"
    );
  });

  const limited = candidates.slice(0, 5);

  const suggestions = limited
    .map((item, index) => {
      const title = item.title || item.message || `Issue ${index + 1}`;
      const fix = item.fix || "Review and remediate this issue based on your internal policies.";
      return {
        key: item.id || `${index}`,
        title,
        fix,
      };
    })
    .filter((s) => s.fix);

  if (!suggestions.length) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <h2 className="text-lg font-semibold">Recommended next actions</h2>
      <p className="text-xs text-neutral-400">
        Prioritized suggestions based on the highest-risk findings in this scan.
      </p>
      <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-neutral-100">
        {suggestions.map((suggestion) => (
          <li key={suggestion.key}>
            <span className="font-medium">{suggestion.title}:</span> {suggestion.fix}
          </li>
        ))}
      </ol>
    </section>
  );
}
