/**
 * Circular compliance score display.
 */
export function ComplianceScore({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
      <p className="text-sm text-gray-500">Compliance Score</p>

      <p className={`mt-4 text-5xl font-bold ${color}`}>
        {score}
      </p>

      <p className="mt-2 text-gray-600">out of 100</p>
    </div>
  );
}
