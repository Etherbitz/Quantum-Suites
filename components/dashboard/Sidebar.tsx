import React from "react";
import Link from "next/link";

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const primaryItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/scan", label: "Start new scan" },
    ...(isAdmin
      ? [
          { href: "/dashboard/analytics", label: "Analytics" },
          { href: "/dashboard/reports", label: "Reports" },
        ]
      : []),
  ];

  return (
    <aside className="flex w-60 flex-col border-r border-neutral-800 bg-neutral-950/80 px-4 py-6 text-sm text-neutral-300">
      <div className="mb-4 px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Quantum Suites
        </p>
        <h2 className="mt-1 text-lg font-semibold text-neutral-50">
          Dashboard
        </h2>
      </div>

      {isAdmin && (
        <div className="mb-4 border-b border-neutral-800 pb-4">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Admin tools
          </p>
          <ul className="mt-2 space-y-1 text-[13px] text-neutral-300">
            <li>
              <Link
                href="/admin"
                className="block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50"
              >
                Admin overview
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50"
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                href="/admin/plans"
                className="block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50"
              >
                Plans & billing
              </Link>
            </li>
            <li>
              <Link
                href="/admin/logs"
                className="block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50"
              >
                Activity log
              </Link>
            </li>
          </ul>
        </div>
      )}

      <nav className="flex-1 px-1">
        <ul className="space-y-1">
          {primaryItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-neutral-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 border-t border-neutral-800 pt-4 text-[11px] text-neutral-500">
        <p>Compliance snapshots, recent scans, and alerts in one place.</p>
      </div>
    </aside>
  );
};