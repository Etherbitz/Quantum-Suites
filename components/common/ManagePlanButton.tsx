"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export function ManagePlanButton({
  label,
}: {
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    await Sentry.startSpan(
      {
        name: "stripe_billing_portal_flow",
        op: "ui.action",
      },
      async () => {
        try {
          const response = await fetch("/api/stripe/portal", {
            method: "POST",
          });

          const text = await response.text();
          let data: any = null;

          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = null;
          }

          if (!response.ok) {
            console.error("Billing portal error:", {
              status: response.status,
              statusText: response.statusText,
              body: text,
              data,
            });

            if (response.status === 401) {
              window.location.href =
                "/sign-in?redirect_url=" +
                encodeURIComponent(window.location.pathname);
              return;
            }

            alert(data?.error || "Failed to open billing portal");
            setLoading(false);
            return;
          }

          if (data?.url) {
            window.location.href = data.url;
          } else {
            console.error("Unexpected billing portal payload:", {
              status: response.status,
              statusText: response.statusText,
              body: text,
              data,
            });
            alert("No billing portal URL returned from server");
            setLoading(false);
          }
        } catch (error) {
          console.error("Billing portal error:", error);
          Sentry.captureException(error);
          alert("Failed to open billing portal. Please try again.");
          setLoading(false);
        }
      }
    );
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
