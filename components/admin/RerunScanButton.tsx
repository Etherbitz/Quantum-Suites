"use client";

import { useState } from "react";

export function RerunScanButton({ scanId }: { scanId: string }) {
  const [loading, setLoading] = useState(false);

  async function rerun() {
    setLoading(true);
    await fetch("/api/scan/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rerunScanId: scanId }),
    });
    setLoading(false);
    alert("Scan requeued");
  }

  return (
    <button
      onClick={rerun}
      disabled={loading}
      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
    >
      {loading ? "Re-running…" : "Re-run Scan"}
    </button>
  );
}
