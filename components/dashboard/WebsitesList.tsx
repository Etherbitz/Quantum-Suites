"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics/track";
import { getComplianceRisk } from "@/lib/compliance";

export interface WebsiteItem {
  id: string;
  url: string;
  nextScanAt: string | null;
  lastScanAt?: string | null;
  lastScore?: number | null;
  lastScanId?: string | null;
}

interface WebsitesListProps {
  websites: WebsiteItem[];
  variant?: "light" | "dark";
}

function getScorePillClasses(score: number): string {
  if (score >= 80) {
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-200";
  }

  if (score >= 50) {
    return "border-amber-500/60 bg-amber-500/10 text-amber-200";
  }

  return "border-red-500/60 bg-red-500/10 text-red-200";
}

export function WebsitesList(
  {
    websites,
    variant = "light",
    showExports = false,
  }: WebsitesListProps & { showExports?: boolean }
) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<
    | { type: "success" | "error"; message: string }
    | null
  >(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const isDark = variant === "dark";

  const handleRemove = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    setToast(null);
    try {
      const res = await fetch(`/api/websites/${id}`, { method: "DELETE" });
      const site = websites.find((w) => w.id === id);

      if (!res.ok) {
        console.error("Failed to remove website");
        setToast({
          type: "error",
          message: "Failed to remove website. Please try again.",
        });
        return;
      }

      if (site) {
        trackEvent("website_removed", {
          websiteId: site.id,
          url: site.url,
        });
      }

      setToast({
        type: "success",
        message: "Website removed.",
      });

      router.refresh();
    } catch (err) {
      console.error("Error removing website", err);
      setToast({
        type: "error",
        message: "Error removing website. Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (websites.length === 0) {
    return (
      <p
        className={
          isDark
            ? "text-sm text-neutral-400"
            : "text-sm text-gray-600"
        }
      >
        You haven&apos;t added any websites yet. Start by running your first
        scan.
      </p>
    );
  }

  return (
    <>
      <ul
        className={`divide-y text-sm ${
          isDark
            ? "divide-neutral-800 text-neutral-200"
            : "divide-gray-200 text-gray-900"
        }`}
      >
        {websites.map((site) => (
          <li
            key={site.id}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p
                className={
                  isDark
                    ? "font-medium text-neutral-50"
                    : "font-medium text-gray-900"
                }
              >
                {site.url}
              </p>
              {site.lastScanAt && (
                <p
                  className={
                    isDark
                      ? "text-xs text-neutral-500"
                      : "text-xs text-gray-500"
                  }
                >
                  Last scan: {new Date(site.lastScanAt).toLocaleString()}
                  {typeof site.lastScore === "number" && (
                    (() => {
                      const risk = getComplianceRisk(site.lastScore ?? 0);
                      return (
                        <span
                          className={`ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getScorePillClasses(
                            site.lastScore ?? 0
                          )}`}
                        >
                          {site.lastScore}/100 · {risk.label}
                        </span>
                      );
                    })()
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(site.id)}
                    disabled={busyId === site.id}
                    className={`ml-3 align-middle text-[10px] font-medium underline-offset-2 disabled:opacity-60 ${
                      isDark
                        ? "text-red-400 hover:text-red-300 hover:underline"
                        : "text-red-600 hover:text-red-700 hover:underline"
                    }`}
                  >
                    {busyId === site.id ? "Removing..." : "Remove"}
                  </button>
                </p>
              )}
              {site.nextScanAt && (
                <p
                  className={
                    isDark
                      ? "text-xs text-neutral-500"
                      : "text-xs text-gray-500"
                  }
                >
                  Next scheduled scan:{" "}
                  {new Date(site.nextScanAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showExports && site.lastScanAt && site.lastScanId && (
                <div className="relative text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === site.id ? null : site.id)
                    }
                    className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-[10px] font-semibold text-emerald-200 shadow-inner hover:bg-emerald-500/25"
                  >
                    Download
                    <span className="ml-1 text-[9px]">▾</span>
                  </button>
                  {menuOpenId === site.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-800 bg-neutral-950 py-1 text-[11px] shadow-lg">
                      <a
                        href={`/api/reports/export-html?scanId=${encodeURIComponent(
                          site.lastScanId
                        )}`}
                        className="block px-3 py-1.5 text-neutral-100 hover:bg-neutral-900"
                        title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
                        onClick={() => setMenuOpenId(null)}
                      >
                        HTML / PDF
                      </a>
                      <a
                        href={`/api/reports/export?reports=1&audit=1&scanId=${encodeURIComponent(
                          site.lastScanId
                        )}`}
                        className="block px-3 py-1.5 text-neutral-100 hover:bg-neutral-900"
                        onClick={() => setMenuOpenId(null)}
                      >
                        CSV
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {toast && (
        <div
          className={`mt-3 inline-flex items-center rounded-md px-3 py-1 text-xs font-medium shadow-sm ${
            toast.type === "success"
              ? isDark
                ? "bg-emerald-500/10 text-emerald-200"
                : "bg-emerald-50 text-emerald-800"
              : isDark
              ? "bg-red-500/10 text-red-200"
              : "bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
