"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ffffff", "#999999", "#666666", "#333333"];
type ScanOverTimePoint = {
  date: string;
  count: number;
};

type ScoreBucket = {
  range: string;
  count: number;
};

export function ScansOverTimeChart({ data }: { data: ScanOverTimePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#ffffff"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScoreDistributionChart({ data }: { data: ScoreBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="range"
          outerRadius={90}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
