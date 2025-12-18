"use client";

import { useState } from "react";

export function UpgradeButton({
  plan,
  label,
}: {
  plan: "starter" | "business";
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);

    await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    window.location.reload();
  }

  return (
    <button
  onClick={upgrade}
  disabled={loading}
  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium
             hover:bg-blue-700 active:scale-[0.98]
             disabled:opacity-50 disabled:cursor-not-allowed
             transition"
>
  {loading ? "Upgrading..." : label}
</button>

  );
}
