import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/dashboard";
import { AlertBell } from "@/components/alerts/AlertBell";

/**
 * Dashboard layout with persistent sidebar navigation.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  let isAdmin = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user) {
      isAdmin = user.role === "ADMIN";
    }
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-neutral-950 via-black to-neutral-950 text-neutral-50">
      <Sidebar isAdmin={isAdmin} />

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-end border-b border-neutral-800 bg-neutral-950/80 px-4 py-3 sm:px-6 lg:px-8 backdrop-blur">
          <AlertBell />
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
