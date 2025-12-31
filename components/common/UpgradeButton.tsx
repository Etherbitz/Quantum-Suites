"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { PLANS } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics/gtag";

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
  const { isSignedIn } = useAuth();

  async function handleClick() {
    // GA4: user clicked an upgrade CTA for a specific plan
    trackEvent("pricing_cta_click", {
      plan,
      location: "pricing_card",
    });

    // If the user is not signed in, send them through sign-up
    // and then straight into the correct Stripe checkout flow.
    if (!isSignedIn) {
      const upgradeTarget = `/billing/upgrade?plan=${plan}`;
      const signUpUrl =
        "/sign-up?redirect_url=" + encodeURIComponent(upgradeTarget);
      window.location.href = signUpUrl;
      return;
    }

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
    ? "w-full px-6 py-4 rounded-xl font-bold text-lg transition-all transform"
    : "w-full rounded-xl px-6 py-3 font-medium transition-all transform";

  const colorClasses = highlight
    ? "bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.7)] hover:shadow-[0_20px_55px_rgba(37,99,235,0.85)] hover:brightness-110 hover:-translate-y-0.5"
    : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5";

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
