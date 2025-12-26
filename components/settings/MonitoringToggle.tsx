"use client";

import { useState } from "react";

interface MonitoringToggleProps {
  websites: { id: string; nextScanAt: string | null }[];
  plan: string;
}

const BUSINESS_DEFAULT_INTERVAL_MINUTES = 1440; // 24 hours

export function MonitoringToggle({ websites, plan }: MonitoringToggleProps) {
  const [loading, setLoading] = useState(false);

  if (!websites.length) return null;

  const anyEnabled = websites.some((w) => w.nextScanAt !== null);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    try {
      await Promise.all(
        websites.map((site) =>
          fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              anyEnabled
                ? { websiteId: site.id, paused: true }
                : {
                    websiteId: site.id,
                    paused: false,
                    ...(plan === "business"
                      ? { intervalMinutes: BUSINESS_DEFAULT_INTERVAL_MINUTES }
                      : {}),
                  }
            ),
          })
        )
      );

      // Refresh to pick up updated nextScanAt values
      window.location.reload();
    } catch (error) {
      console.error("Failed to update monitoring schedule", error);
    } finally {
      setLoading(false);
    }
  }

  const label = anyEnabled ? "Turn off for all sites" : "Turn on for all sites";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-100 shadow-sm transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
    >
      {loading ? "Saving…" : label}
    </button>
  );
}
