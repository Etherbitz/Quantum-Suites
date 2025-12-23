"use client";

import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";
import { getComplianceRisk } from "@/lib/compliance";
import { useState } from "react";

type ScanJob = {
  id: string;
  status: string;
  score: number | null;
  createdAt: Date | string;
  website?: {
    url: string;
  } | null;
};

interface ScanHistoryProps {
  scans: ScanJob[];
  showFilter?: boolean;
}

/**
 * Maps compliance risk level to Tailwind UI styles.
 * UI concern ONLY — intentionally not in /lib/compliance
 */
function getRiskStyles(level: "low" | "medium" | "high" | "pending") {
  switch (level) {
    case "low":
      return "bg-green-900 text-green-300";
    case "medium":
      return "bg-yellow-900 text-yellow-300";
    case "high":
      return "bg-red-900 text-red-300";
    case "pending":
    default:
      return "bg-neutral-800 text-neutral-300";
  }
}

export default function ScanHistory({ scans, showFilter = false }: ScanHistoryProps) {
  const [query, setQuery] = useState("");

  if (scans.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <p className="text-neutral-400">
          No scans yet. Start by scanning your website.
        </p>

        <Link
          href="/scan"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-2 text-sm font-medium text-black hover:bg-neutral-200 transition"
        >
          Scan Website
        </Link>
      </div>
    );
  }

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? scans.filter((scan) => {
        const url = (scan.website?.url ?? "").toLowerCase();
        const status = scan.status.toLowerCase();
        const id = scan.id.toLowerCase();
        return (
          url.includes(normalized) ||
          status.includes(normalized) ||
          id.includes(normalized)
        );
      })
    : scans;

  const visibleScans = filtered;

  if (visibleScans.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-400">
        No scans match your filters. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilter && scans.length > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by URL, status, or scan ID"
            className="w-full max-w-xs rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
          <span className="hidden text-[11px] md:inline">
            Showing {visibleScans.length} of {scans.length} scans
          </span>
        </div>
      )}

      {visibleScans.map((scan) => {
        const risk = getComplianceRisk(scan.score);
        const riskStyles = getRiskStyles(risk.level);

        return (
          <div
            key={scan.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-neutral-700"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Left */}
              <div className="flex-1 space-y-2">
                {scan.website?.url && (
                  <a
                    href={scan.website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:underline"
                  >
                    {scan.website.url}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskStyles}`}
                  >
                    {risk.label}
                  </span>

                  <span className="uppercase tracking-wide">
                    {scan.status}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <div className="text-3xl font-semibold">
                  {scan.score ?? "—"}
                </div>
                <div className="text-xs text-neutral-500">
                  Score
                </div>
              </div>
            </div>

            <Link
              href={`/scan/results?scanId=${scan.id}`}
              className="mt-4 inline-block text-sm font-medium text-blue-400 hover:underline"
            >
              View details →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
