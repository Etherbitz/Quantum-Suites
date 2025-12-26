import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 text-sm text-gray-500"
    >
      {items.map((item, index) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700">{item.label}</span>
          )}

          {index < items.length - 1 && (
            <span className="mx-2">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}
