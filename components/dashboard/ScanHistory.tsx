"use client";

import Link from "next/link";
import { ExternalLink, Calendar, Download, Trash2 } from "lucide-react";
import { getComplianceRisk } from "@/lib/compliance";
import { useState } from "react";

type ScanJob = {
  id: string;
  status: string;
  score: number | null;
  createdAt: Date | string;
  // Optional fields that may be present on ScanJob
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary?: any;
  error?: string | null;
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
  const [items, setItems] = useState<ScanJob[]>(scans);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (items.length === 0) {
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
    ? items.filter((scan) => {
        const url = (scan.website?.url ?? "").toLowerCase();
        const status = scan.status.toLowerCase();
        const id = scan.id.toLowerCase();
        return (
          url.includes(normalized) ||
          status.includes(normalized) ||
          id.includes(normalized)
        );
      })
    : items;

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
      {showFilter && items.length > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by URL, status, or scan ID"
            className="w-full max-w-xs rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
          <span className="hidden text-[11px] md:inline">
            Showing {visibleScans.length} of {items.length} scans
          </span>
        </div>
      )}

      {visibleScans.map((scan) => {
        const risk = getComplianceRisk(scan.score);
        const riskStyles = getRiskStyles(risk.level);

        // Derive a human-readable reason for non-successful scans
        const rawError = (scan as any).error as string | null | undefined;
        const summary = (scan as any).summary as
          | { mode?: string; reason?: string }
          | null
          | undefined;

        let reasonLabel: string | null = null;

        if (summary?.mode === "partial") {
          reasonLabel =
            summary.reason ??
            "Partial results only — the scan encountered an error partway through.";
        } else if (scan.status.toLowerCase() === "failed") {
          if (rawError === "CONCURRENCY_LIMIT") {
            reasonLabel =
              "Not run: too many scans were already running in parallel for this user.";
          } else if (rawError === "WEBSITE_NOT_FOUND") {
            reasonLabel = "Website record was missing when this scan attempted to run.";
          } else if (typeof rawError === "string" && rawError) {
            reasonLabel = rawError;
          }
        }

        const handleDelete = async () => {
          if (
            !window.confirm(
              "Delete this scan from your history? This will also remove any related alerts."
            )
          ) {
            return;
          }

          try {
            setDeletingId(scan.id);

            const res = await fetch("/api/scan/delete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ scanId: scan.id }),
            });

            if (!res.ok) {
              throw new Error("Failed to delete scan");
            }

            setItems((prev) => prev.filter((s) => s.id !== scan.id));
          } catch (err) {
            console.error("DELETE_SCAN_FAILED", err);
            alert("Could not delete this scan. Please try again.");
          } finally {
            setDeletingId((current) => (current === scan.id ? null : current));
          }
        };

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

                {reasonLabel && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {reasonLabel}
                  </p>
                )}
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2 text-right">
                <div>
                  <div className="text-3xl font-semibold">
                    {scan.score ?? "—"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Score
                  </div>
                </div>
                <div className="flex gap-1 text-[11px]">
                  <a
                    href={`/api/reports/export?reports=1&audit=1&scanId=${encodeURIComponent(
                      scan.id
                    )}`}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    <Download className="h-3 w-3" />
                    <span>CSV</span>
                  </a>
                  <a
                    href={`/api/reports/export-html?scanId=${encodeURIComponent(
                      scan.id
                    )}`}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
                    title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
                  >
                    <Download className="h-3 w-3" />
                    <span>HTML</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <Link
                  href={`/scan/results?scanId=${scan.id}`}
                  className="text-sm font-medium text-blue-400 hover:underline"
                >
                  View details
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletingId === scan.id}
                  className="inline-flex items-center gap-1 rounded-full border border-red-900/60 bg-red-950/60 px-2.5 py-1 text-[11px] font-medium text-red-200 hover:border-red-500 hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{deletingId === scan.id ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
              <span className="text-[11px] text-neutral-500">
                Quick exports: per-scan CSV / HTML
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
