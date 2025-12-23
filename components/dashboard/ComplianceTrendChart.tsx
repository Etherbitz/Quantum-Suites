"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

type Point = {
  date: string;
  score: number;
  websiteId?: string;
  website: string;
};

export function ComplianceTrendChart({
  websites,
}: {
  websites: { id: string; url: string }[];
}) {
  const [data, setData] = useState<Point[]>([]);
  const [websiteId, setWebsiteId] = useState<string | "all">("all");
  const [days, setDays] = useState<number>(7);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (websiteId !== "all") {
        params.set("websiteId", websiteId);
      }

      const res = await fetch(
        `/api/dashboard/compliance-trends?${params.toString()}`
      );

      if (res.ok) {
        const json = await res.json();
        setDays(json.days);
        setData(json.points);
      }
    }

    load();
  }, [websiteId]);

  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].score;
    const last = data[data.length - 1].score;
    const diff = last - first;
    const pct = Math.round((diff / first) * 100);
    return { diff, pct };
  }, [data]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Compliance Trend ({days} days)
        </h3>

        <select
          value={websiteId}
          onChange={(e) => setWebsiteId(e.target.value)}
          className="rounded-lg bg-neutral-900 border border-neutral-800 p-2 text-sm"
        >
          <option value="all">All websites</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.url}
            </option>
          ))}
        </select>
      </div>

      {trend && (
        <p
          className={`text-sm ${
            trend.diff >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {trend.diff >= 0 ? "↑" : "↓"}{" "}
          {Math.abs(trend.pct)}% over period
        </p>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString()
              }
              stroke="#666"
            />
            <YAxis domain={[0, 100]} stroke="#666" />
            <Tooltip
              labelFormatter={(v) =>
                new Date(v).toLocaleString()
              }
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
