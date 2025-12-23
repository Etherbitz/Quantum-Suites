"use client";

import { useState } from "react";

interface Props {
  initialValue: number;
  min: number;
  max: number;
}

export function AlertThresholdSetting({
  initialValue,
  min,
  max,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings/alert-threshold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setSaving(false);
  }

  return (
    <div className="rounded-xl border bg-white p-6 space-y-4">
      <h3 className="text-lg font-semibold">
        Alert Sensitivity
      </h3>

      <p className="text-sm text-gray-500">
        Receive an alert when your compliance score drops by this percentage.
      </p>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-12 text-right font-medium">
          {value}%
        </span>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
