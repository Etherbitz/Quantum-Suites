"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActivityLogBulkActionsProps {
  hasJobs: boolean;
}

export function ActivityLogBulkActions({
  hasJobs,
}: ActivityLogBulkActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDeleteAll() {
    if (!hasJobs || loading) return;

    const confirmed = window.confirm(
      "Clear all activity logs? This removes all scan jobs and related alerts across the system."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      });

      if (!res.ok) {
        console.error("Failed to clear activity logs");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDeleteAll}
      disabled={!hasJobs || loading}
      className="rounded-md border border-red-500/40 px-3 py-1.5 text-[11px] font-medium text-red-300 hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Clearing…" : "Clear all"}
    </button>
  );
}
