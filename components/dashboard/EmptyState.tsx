/**
 * Empty state component.
 */
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10 rounded-xl border bg-white p-10 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
