"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { PLANS } from "@/lib/plans";

export function UpgradeButton({
  plan,
  label,
  highlight = false,
  fullWidth = false,
}: {
  plan: "starter" | "business" | "agency";
  label: string;
  highlight?: boolean;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await Sentry.startSpan(
      {
        name: "plan_change_flow",
        op: "ui.action",
        attributes: { plan },
      },
      async () => {
        try {
          const planData = PLANS[plan];
          const stripePriceId = planData.stripePriceId;

          if (!stripePriceId) {
            alert("This plan is not available yet");
            setLoading(false);
            return;
          }

          // Create Stripe checkout session (upgrades / new subscriptions)
          const response = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              priceId: stripePriceId,
              planName: plan,
            }),
          });
          const text = await response.text();
          let data: any = null;

          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = null;
          }

          if (!response.ok) {
            // Special-case unauthenticated users: send them to sign-in
            if (response.status === 401) {
              console.warn(
                "Upgrade requires authentication, redirecting to sign-in.",
                {
                  status: response.status,
                  body: text,
                }
              );
              window.location.href =
                "/sign-in?redirect_url=" +
                encodeURIComponent(window.location.pathname);
              return;
            }

            // Handle incomplete profile separately so we can guide the user.
            if (response.status === 400 && data?.code === "PROFILE_INCOMPLETE") {
              console.warn("Profile incomplete for upgrade", {
                missingFields: data?.missingFields,
              });
              alert(
                data?.message ||
                  "Please complete your billing profile (name and address) before upgrading."
              );
              window.location.href = "/dashboard/settings";
              return;
            }

            console.error("Upgrade error response:", {
              status: response.status,
              statusText: response.statusText,
              body: text,
              data,
            });

            alert(data?.error || "Checkout request failed");
            setLoading(false);
            return;
          }

          if (data?.url) {
            // Redirect to Stripe checkout
            window.location.href = data.url;
          } else {
            console.error("Unexpected checkout payload:", {
              status: response.status,
              statusText: response.statusText,
              body: text,
              data,
            });
            alert("No checkout URL returned from server");
            setLoading(false);
          }
        } catch (error) {
          console.error("Upgrade error:", error);
          Sentry.captureException(error, {
            data: { plan },
          });
          alert("Failed to start checkout. Please try again.");
          setLoading(false);
        }
      }
    );
  }

  const baseClasses = fullWidth 
    ? "w-full px-6 py-4 rounded-xl font-bold text-lg transition-all"
    : "w-full rounded-lg px-6 py-3 font-medium transition";

  const colorClasses = highlight
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
    : "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
