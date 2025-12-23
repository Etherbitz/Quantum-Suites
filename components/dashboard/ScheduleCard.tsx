"use client";

import { useState } from "react";

type Props = {
  websiteId: string;
  nextScanAt: string | null;
  plan: string;
};

type UpdatePayload = {
  paused?: boolean;
  intervalMinutes?: number;
};

const BUSINESS_INTERVALS = [
  { label: "Every 24 hours", value: 1440 },
  { label: "Every 6 hours", value: 360 },
  { label: "Every 1 hour", value: 60 },
  { label: "Every 15 minutes", value: 15 },
];

export function ScheduleCard({ websiteId, nextScanAt, plan }: Props) {
  const [loading, setLoading] = useState(false);
  const enabled = Boolean(nextScanAt);

  async function updateSchedule(data: UpdatePayload) {
    setLoading(true);
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId,
        ...data,
      }),
    });
    setLoading(false);
    location.reload();
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
      <h3 className="text-lg font-medium">Scheduled Scans</h3>

      {plan === "free" ? (
        <p className="text-sm text-neutral-400">
          Automated scans are available on paid plans.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">
              Automation
            </span>
            <button
              disabled={loading}
              onClick={() =>
                updateSchedule({ paused: enabled })
              }
              className="rounded-lg bg-white px-3 py-1 text-sm text-black hover:bg-neutral-200"
            >
              {enabled ? "Pause" : "Enable"}
            </button>
          </div>

          {enabled && (
            <p className="text-xs text-neutral-500">
              Next scan: {new Date(nextScanAt!).toLocaleString()}
            </p>
          )}

          {plan === "business" && enabled && (
            <div className="pt-4 space-y-2">
              <label className="text-xs text-neutral-400">
                Scan frequency
              </label>
              <select
                disabled={loading}
                onChange={(e) =>
                  updateSchedule({
                    intervalMinutes: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-sm"
              >
                {BUSINESS_INTERVALS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
