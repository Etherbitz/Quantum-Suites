"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

export function DangerZone() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<
    | { type: "success" | "error"; message: string }
    | null
  >(null);

  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    setToast(null);
    try {
      const res = await fetch("/api/account/history", { method: "POST" });
      if (!res.ok) {
        console.error("Failed to clear history");
        setToast({
          type: "error",
          message: "Failed to clear scan history. Please try again.",
        });
        return;
      }
      trackEvent("scan_history_cleared");
      setToast({
        type: "success",
        message: "Scan history cleared.",
      });
      router.refresh();
    } catch (err) {
      console.error("Error clearing history", err);
      setToast({
        type: "error",
        message: "Error clearing history. Please try again.",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;
    if (!window.confirm("This will permanently delete your account and all data. Continue?")) {
      return;
    }
    setDeleting(true);
    setToast(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        console.error("Failed to delete account");
        setToast({
          type: "error",
          message: "Failed to delete account. Please try again.",
        });
        setDeleting(false);
        return;
      }
      trackEvent("account_deleted");
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account", err);
      setToast({
        type: "error",
        message: "Error deleting account. Please try again.",
      });
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-500/30 bg-linear-to-br from-red-950 via-neutral-950 to-neutral-950 px-5 py-5 text-sm shadow-sm shadow-red-500/20">
      <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-red-300">
        Danger zone
      </h2>
      <p className="mt-1 text-[11px] text-red-200/80">
        These actions are destructive and cannot be undone.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          onClick={handleClearHistory}
          disabled={clearing}
          className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
        >
          {clearing ? "Clearing..." : "Clear all scan history"}
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="inline-flex items-center rounded-full border border-red-500 bg-red-600 px-3 py-1.5 font-medium text-white shadow-sm shadow-red-500/40 hover:bg-red-500 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete account"}
        </button>
      </div>

      {toast && (
        <div
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-500/10 text-emerald-200"
              : "bg-red-500/20 text-red-100"
          }`}
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}
