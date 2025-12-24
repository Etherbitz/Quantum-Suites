"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "qs-cookie-consent";

export function CookieBanner() {
  // Render visible by default in the initial HTML so scanners
  // and first-time visitors see the banner before any scripts run.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: "accepted", at: new Date().toISOString() }));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-xs text-neutral-200 shadow-lg shadow-black/60 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
        <div className="mb-2 space-y-1 sm:mb-0">
          <p className="font-medium text-neutral-50">Cookie consent</p>
          <p className="text-[11px] text-neutral-400">
            We use essential cookies and optional analytics to understand how Quantum Suites AI is used. By clicking "Accept cookies" you give consent; you can manage cookies at any time in your browser settings.
          </p>
          <Link
            href="/privacy"
            className="inline-flex text-[11px] font-medium text-neutral-200 underline underline-offset-2 hover:text-white"
          >
            Learn more in our privacy policy
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-semibold text-neutral-900 hover:bg-white"
          >
            Accept cookies
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="inline-flex items-center rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] font-medium text-neutral-300 hover:border-neutral-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
