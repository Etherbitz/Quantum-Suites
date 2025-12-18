/**
 * Metric card component.
 */
export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber" | "green" | "red";
}) {
  const color =
    accent === "amber"
      ? "text-amber-600"
      : accent === "green"
      ? "text-emerald-600"
      : accent === "red"
      ? "text-red-600"
      : "text-gray-900";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
}
