"use client";

import { useMemo, useState } from "react";

type Severity = "warning" | "critical";

export type AlertsTableAlert = {
  id: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  severity: Severity;
  acknowledged: boolean;
  createdAt: string;
  scanJobId?: string | null;
  websiteUrl?: string | null;
};

interface AlertsTableProps {
  alerts: AlertsTableAlert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
  const [rows, setRows] = useState(alerts);
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [statusFilter, setStatusFilter] = useState<"open" | "all">("open");

  const filtered = useMemo(
    () =>
      rows.filter((alert) => {
        if (statusFilter === "open" && alert.acknowledged) return false;
        if (severityFilter !== "all" && alert.severity !== severityFilter) {
          return false;
        }
        return true;
      }),
    [rows, severityFilter, statusFilter]
  );

  async function acknowledge(id: string) {
    setRows((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );

    try {
      await fetch(`/api/alerts/${id}/acknowledge`, {
        method: "POST",
      });
    } catch {
      // best-effort; user will see corrected state on next load
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="uppercase tracking-[0.22em] text-neutral-500">
            Filters
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("open")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === "open"
                ? "bg-emerald-500 text-black"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Open only
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === "all"
                ? "bg-emerald-500 text-black"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            All alerts
          </button>

          <span className="mx-1 h-3 w-px bg-neutral-800" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setSeverityFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              severityFilter === "all"
                ? "bg-neutral-800 text-neutral-100"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            All severities
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("critical")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              severityFilter === "critical"
                ? "bg-red-500 text-black"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("warning")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              severityFilter === "warning"
                ? "bg-amber-400 text-black"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Warnings
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/80">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            No alerts match your filters.
          </div>
        ) : (
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const created = new Date(alert.createdAt);
                const isCritical = alert.severity === "critical";
                const isOpen = !alert.acknowledged;
                const hasScanLink = !!alert.scanJobId;

                return (
                  <tr
                    key={alert.id}
                    className="border-b border-neutral-900/80 last:border-0 hover:bg-neutral-900/60"
                  >
                    <td className="px-4 py-3 align-top text-[11px] text-neutral-300">
                      <div>{created.toLocaleDateString()}</div>
                      <div className="text-[10px] text-neutral-500">
                        {created.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm">
                      <span className="font-semibold text-neutral-50">
                        {alert.currentScore}/100
                      </span>
                      <span className="ml-1 text-[11px] text-neutral-400">
                        from {alert.previousScore}/100
                      </span>
                      <div className="text-[11px] text-neutral-400">
                        Change: {alert.delta > 0 ? "+" : ""}
                        {alert.delta} pts
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          isCritical
                            ? "bg-red-500/10 text-red-300 border border-red-500/40"
                            : "bg-amber-400/10 text-amber-200 border border-amber-400/40"
                        }`}
                      >
                        {isCritical ? "Critical" : "Warning"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                          isOpen
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                            : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                        }`}
                      >
                        {isOpen ? "Open" : "Acknowledged"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] text-neutral-400">
                      We detected a significant drop in your portfolio
                      compliance score
                      {alert.websiteUrl
                        ? ` affecting ${alert.websiteUrl}`
                        : ""}
                      . Review recent scans to confirm if a content, theme,
                      or plugin change caused this.
                    </td>
                    <td className="px-4 py-3 align-top text-right text-[11px]">
                      <div className="flex flex-col items-end gap-1">
                        {hasScanLink && (
                          <a
                            href={`/scan/results?scanId=${encodeURIComponent(
                              alert.scanJobId as string
                            )}`}
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
                          >
                            <span>View scan</span>
                          </a>
                        )}
                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => acknowledge(alert.id)}
                            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900 hover:bg-white"
                          >
                            Mark as resolved
                          </button>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
