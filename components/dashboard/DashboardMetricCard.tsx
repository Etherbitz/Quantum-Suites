import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  accent?: "default" | "amber" | "danger";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  accent = "default",
}) => {
  const accentClasses =
    accent === "amber"
      ? "border-amber-400/60 bg-amber-500/10 text-amber-50"
      : accent === "danger"
      ? "border-red-500/60 bg-red-500/10 text-red-50"
      : "border-neutral-800 bg-neutral-950/80 text-neutral-50";

  return (
    <div
      className={`flex flex-col rounded-2xl border px-4 py-3 text-xs shadow-sm ${accentClasses}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold leading-tight">{value}</p>
    </div>
  );
};