"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActivityLogRowActionsProps {
  jobId: string;
}

export function ActivityLogRowActions({
  jobId,
}: ActivityLogRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    const confirmed = window.confirm(
      "Delete this log entry? This will remove the scan job and its alerts."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        console.error("Failed to delete log entry");
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
      onClick={handleDelete}
      disabled={loading}
      className="text-[11px] text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
