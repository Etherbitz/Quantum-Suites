"use client";

import { useEffect, useState } from "react";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";

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
  const unlimited =
    data.websitesLimit === -1 ||
    data.websitesLimit === null ||
    typeof data.websitesLimit !== "number";

  const limitValue = unlimited ? Infinity : data.websitesLimit;

  const percent = unlimited
    ? 0
    : Math.min(100, (data.websitesUsed / limitValue) * 100);

  const isAtLimit = !unlimited && data.websitesUsed >= limitValue;

  return (
    <div className="rounded border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          Plan: <strong className="capitalize">{data.plan}</strong>
        </span>
        <span>
          {data.websitesUsed} /{" "}
          {unlimited ? "∞" : limitValue} websites
        </span>
      </div>

      {!unlimited && (
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
