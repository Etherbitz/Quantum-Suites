import React from "react";
import Link from "next/link";

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const menuItems = [
    { href: "/dashboard", label: "Overview" },
    ...(isAdmin
      ? [
          { href: "/dashboard/analytics", label: "Analytics" },
          { href: "/dashboard/reports", label: "Reports" },
        ]
      : []),
  ];

  return (
    <aside className="flex w-60 flex-col border-r border-neutral-800 bg-neutral-950/80 px-4 py-6 text-sm text-neutral-300">
      <div className="mb-6 px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Quantum Suites
        </p>
        <h2 className="mt-1 text-lg font-semibold text-neutral-50">
          Dashboard
        </h2>
      </div>

      <nav className="flex-1 px-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
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