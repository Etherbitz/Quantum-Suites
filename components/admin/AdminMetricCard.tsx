"use client";

type AdminMetricCardProps = {
	label: string;
	value: string | number;
	hint?: string;
};

/**
 * Minimal admin metric card placeholder.
 */
export function AdminMetricCard({ label, value, hint }: AdminMetricCardProps) {
	return (
		<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
			<p className="text-xs uppercase tracking-wide text-neutral-500">
				{label}
			</p>
			<p className="text-2xl font-semibold text-white">{value}</p>
			{hint && (
				<p className="text-xs text-neutral-500">
					{hint}
				</p>
			)}
		</div>
	);
}
