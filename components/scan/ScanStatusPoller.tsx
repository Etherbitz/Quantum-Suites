"use client";

import { useEffect, useState } from "react";

type ScanStatus = {
  id: string;
  status: string;
  score?: number | null;
};

export function ScanStatusPoller({ scanId }: { scanId: string }) {
  const [data, setData] = useState<ScanStatus | null>(null);

  useEffect(() => {
    if (!scanId) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/scan/create/status?scanId=${scanId}`,
        { cache: "no-store" }
      );

      if (!res.ok) return;

      const json = await res.json();
      setData(json);
    }, 2000);

    return () => clearInterval(interval);
  }, [scanId]);

  if (!data) {
    return (
      <p className="text-sm text-neutral-400">
        Initializing scan…
      </p>
    );
  }

  if (data.status !== "COMPLETED") {
    return (
      <p className="text-sm text-neutral-400">
        Scan in progress…
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-neutral-400">
        Scan completed
      </p>
      <p className="text-2xl font-semibold">
        Compliance Score: {data.score}
      </p>
    </div>
  );
}
