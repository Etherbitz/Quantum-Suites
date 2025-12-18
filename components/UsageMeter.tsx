"use client";

import { useEffect, useState } from "react";
import { UpgradeCTA } from "@/components/UpgradeCTA";

type UsageData = {
  authenticated: boolean;
  plan: string;
  websitesUsed: number;
  websitesLimit: number;
};

export function UsageMeter() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
  fetch("/api/usage")
    .then(async (res) => {
      if (!res.ok) return null;

      const text = await res.text();
      if (!text) return null;

      return JSON.parse(text);
    })
    .then(setData)
    .catch(() => {
      setData(null);
    });
  }, []);


  if (!data || !data.authenticated) return null;

  const percent =
    data.websitesLimit === Infinity
      ? 0
      : Math.min(100, (data.websitesUsed / data.websitesLimit) * 100);

  const isAtLimit =
    data.websitesLimit !== Infinity &&
    data.websitesUsed >= data.websitesLimit;

  return (
    <div className="rounded border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          Plan: <strong className="capitalize">{data.plan}</strong>
        </span>
        <span>
          {data.websitesUsed} /{" "}
          {data.websitesLimit === Infinity ? "∞" : data.websitesLimit} websites
        </span>
      </div>

      {data.websitesLimit !== Infinity && (
        <div className="w-full h-2 bg-muted rounded overflow-hidden">
          <div
            className={`h-full ${
              isAtLimit ? "bg-red-500" : "bg-primary"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {isAtLimit && <UpgradeCTA />}
    </div>
  );
}
