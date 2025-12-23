"use client";

type ScanFilterProps = {
	value: string;
	onChange: (value: string) => void;
};

/**
 * Placeholder scan filter control for admin views.
 */
export function ScanFilter({ value, onChange }: ScanFilterProps) {
	return (
		<div className="flex items-center gap-2">
			<label className="text-sm text-neutral-400" htmlFor="scan-filter">
				Filter scans
			</label>
			<input
				id="scan-filter"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search by URL or status"
				className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
				type="text"
			/>
		</div>
	);
}
