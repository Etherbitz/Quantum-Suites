import Link from "next/link";

export function UpgradeCTA() {
  return (
    <div className="rounded bg-muted p-3 text-sm text-center space-y-2">
      <p className="font-medium">
        You’ve reached your plan limit.
      </p>
      <Link
        href="/pricing"
        className="inline-block rounded bg-primary px-4 py-2 text-white text-sm"
      >
        Upgrade to continue
      </Link>
    </div>
  );
}
