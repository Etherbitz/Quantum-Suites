"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Trash2, ChevronDown } from "lucide-react";

interface AdminScanActionsProps {
  scanId: string;
  canAuditTrail: boolean;
}

export function AdminScanActions({
  scanId,
  canAuditTrail,
}: AdminScanActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const csvHref = `/api/admin/reports/export?reports=1${
    canAuditTrail ? "&audit=1" : ""
  }&scanId=${encodeURIComponent(scanId)}`;

  const htmlHref = `/api/admin/reports/export-html?scanId=${encodeURIComponent(
    scanId
  )}`;

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this scan from history? This will also remove any related alerts."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch("/api/scan/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scanId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete scan");
      }

      // Simple refresh to reflect deletion in server-rendered table
      window.location.reload();
    } catch (error) {
      console.error("ADMIN_DELETE_SCAN_FAILED", error);
      alert("Could not delete this scan. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-[11px]">
      <Link
        href={`/scan/results?scanId=${scanId}`}
        className="rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
      >
        Open
      </Link>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800"
        >
          <Download className="h-3 w-3" />
          <span>Export</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-neutral-800 bg-neutral-950 py-1 text-[11px] shadow-lg">
            <a
              href={csvHref}
              className="block px-3 py-1.5 text-left text-neutral-100 hover:bg-neutral-900"
              title="Download CSV export for this scan"
              onClick={() => setOpen(false)}
            >
              CSV export
            </a>
            <a
              href={htmlHref}
              className="block px-3 py-1.5 text-left text-neutral-100 hover:bg-neutral-900"
              title="Open printable HTML report for this scan"
              onClick={() => setOpen(false)}
            >
              HTML report
            </a>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1 rounded-full border border-red-900/60 bg-red-950/60 px-2.5 py-1 font-medium text-red-200 hover:border-red-500 hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Trash2 className="h-3 w-3" />
        <span>{deleting ? "Deleting…" : "Delete"}</span>
      </button>
    </div>
  );
}
