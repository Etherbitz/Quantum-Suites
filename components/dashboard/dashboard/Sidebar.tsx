import React from 'react';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/reports', label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      <nav className="px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};