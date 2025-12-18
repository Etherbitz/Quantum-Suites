"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasFeature } from "@/lib/featureAccess";
import { UsageMeter } from "@/components/UsageMeter";

/**
 * Sidebar navigation component.
 */
export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "Settings", href: "/dashboard/settings" },
  ];

  const gatedNavItems = [
    ...(user && hasFeature(user.plan, "continuousMonitoring") ? [{ label: "Monitoring", href: "/dashboard/monitoring" }] : []),
    ...(user && hasFeature(user.plan, "changeAlerts") ? [{ label: "Alerts", href: "/dashboard/alerts" }] : []),
  ];

  return (
    <aside className="w-64 border-r bg-white px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Quantum Suites AI
      </h2>

      <nav className="space-y-2">
        {[...navItems, ...gatedNavItems].map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block rounded-lg px-3 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        <UsageMeter />
      </div>
    </aside>
  );
}
