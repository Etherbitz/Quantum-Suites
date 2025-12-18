/**
 * Loading skeleton placeholder.
 */
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="mt-4 h-6 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}
