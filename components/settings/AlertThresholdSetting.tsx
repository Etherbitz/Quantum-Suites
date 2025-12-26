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
    <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4 text-xs text-neutral-200 md:px-5 md:py-5">
      <h3 className="text-sm font-semibold text-neutral-50">
        Alert sensitivity
      </h3>

      <p className="text-xs text-neutral-400">
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
        <span className="w-12 text-right text-sm font-medium text-neutral-100">
          {value}%
        </span>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
