"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();

  const primaryItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/scan", label: "New scan" },
  ];

  const adminItems = isAdmin
    ? [
        { href: "/admin", label: "Admin overview" },
        { href: "/admin/users", label: "Customers" },
        { href: "/admin/plans", label: "Plans & billing" },
        { href: "/admin/logs", label: "Activity log" },
        { href: "/dashboard/analytics", label: "Analytics" },
        { href: "/admin/reports", label: "Reports & exports" },
      ]
    : [];

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
            {adminItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                    pathname.startsWith(item.href)
                      ? "bg-neutral-900 text-neutral-50"
                      : "text-neutral-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="flex-1 px-1">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Workspace
        </p>
        <ul className="mt-2 space-y-1 text-[13px]">
          {primaryItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                  pathname.startsWith(item.href)
                    ? "bg-neutral-900 text-neutral-50"
                    : "text-neutral-300"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Websites
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            <li>
              <Link
                href="/dashboard/websites"
                className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                  pathname.startsWith("/dashboard/websites")
                    ? "bg-neutral-900 text-neutral-50"
                    : "text-neutral-300"
                }`}
              >
                Manage websites
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/reports"
                className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                  pathname.startsWith("/dashboard/reports")
                    ? "bg-neutral-900 text-neutral-50"
                    : "text-neutral-300"
                }`}
              >
                Reports & exports
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/alerts"
                className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                  pathname.startsWith("/dashboard/alerts")
                    ? "bg-neutral-900 text-neutral-50"
                    : "text-neutral-300"
                }`}
              >
                Alerts & changes
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Account
          </p>
          <ul className="mt-2 space-y-1 text-[13px]">
            <li>
              <Link
                href="/dashboard/settings"
                className={`block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-800 hover:text-neutral-50 ${
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-neutral-900 text-neutral-50"
                    : "text-neutral-300"
                }`}
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mt-6 border-t border-neutral-800 pt-4 text-[11px] text-neutral-500">
        <p>Compliance snapshots, recent scans, and alerts in one place.</p>
      </div>
    </aside>
  );
};