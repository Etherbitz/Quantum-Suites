import Link from "next/link";

export function UpgradeCTA({ reason }: { reason?: string }) {
  return (
    <div className="space-y-2 text-sm text-center">
      {reason && (
        <p className="text-xs text-neutral-400">
          {reason}
        </p>
      )}
      <Link
        href="/pricing"
        className="inline-flex items-center justify-center rounded-full border border-blue-500 bg-blue-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm shadow-blue-500/40 transition hover:bg-blue-500 hover:border-blue-400 hover:shadow-blue-400/60"
      >
        Upgrade to continue
      </Link>
    </div>
  );
}
