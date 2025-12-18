import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

/**
 * Dashboard layout with persistent sidebar navigation.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 px-8 py-6">
        {children}
      </main>
    </div>
  );
}
