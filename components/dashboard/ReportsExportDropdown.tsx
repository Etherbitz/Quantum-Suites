"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";

interface ReportsExportDropdownProps {
  from: string;
  to: string;
  website: string;
  canExport: boolean;
  canExportAuditTrail: boolean;
}

export function ReportsExportDropdown({
  from,
  to,
  website,
  canExport,
  canExportAuditTrail,
}: ReportsExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [includeReports, setIncludeReports] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(false);

  const htmlSearch = new URLSearchParams({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(website ? { website } : {}),
  });

  const csvSearch = new URLSearchParams({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(website ? { website } : {}),
  });

  if (includeReports) {
    csvSearch.set("reports", "1");
  }
  if (includeAudit) {
    csvSearch.set("audit", "1");
  }

  const csvHref = `/api/reports/export?${csvSearch.toString()}`;
  const htmlHref = `/api/reports/export-html?${htmlSearch.toString()}`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-300">
      <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={includeReports}
              onChange={(e) => setIncludeReports(e.target.checked)}
              disabled={!canExport}
              className="h-3 w-3 rounded border-neutral-700 bg-neutral-950 text-blue-500"
            />
            <span>Reports</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={includeAudit}
              onChange={(e) => setIncludeAudit(e.target.checked)}
              disabled={!canExport || !canExportAuditTrail}
              className="h-3 w-3 rounded border-neutral-700 bg-neutral-950 text-blue-500"
            />
            <span>Audit trail</span>
          </label>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 100)}
            disabled={!canExport}
            className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-1.5 font-medium text-neutral-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {open && (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-neutral-800 bg-neutral-950 py-1 text-[11px] shadow-lg">
              <a
                href={csvHref}
                className="block px-3 py-1.5 text-left text-neutral-100 hover:bg-neutral-900"
                onClick={() => setOpen(false)}
              >
                CSV export
              </a>
              <a
                href={htmlHref}
                className="block px-3 py-1.5 text-left text-neutral-100 hover:bg-neutral-900"
                title="Opens a printable HTML report; use your browser's Print menu to save as PDF."
                onClick={() => setOpen(false)}
              >
                HTML report
              </a>
            </div>
          )}
        </div>
      </div>

      {!canExport && (
        <div className="w-full">
          <UpgradeCTA reason="Exports are available on Business and Agency plans." />
        </div>
      )}
    </div>
  );
}
