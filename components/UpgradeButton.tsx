"use client";

import { useState } from "react";
import { PLANS } from "@/lib/plans";

export function UpgradeButton({
  plan,
  label,
  highlight = false,
  fullWidth = false,
}: {
  plan: "starter" | "business";
  label: string;
  highlight?: boolean;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);

    try {
      const planData = PLANS[plan];
      const stripePriceId = planData.stripePriceId;

      if (!stripePriceId) {
        alert("This plan is not available yet");
        setLoading(false);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: stripePriceId,
          planName: plan,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  const baseClasses = fullWidth 
    ? "w-full px-6 py-4 rounded-xl font-bold text-lg transition-all"
    : "w-full rounded-lg px-6 py-3 font-medium transition";

  const colorClasses = highlight
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
    : "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <button
      onClick={upgrade}
      disabled={loading}
      className={`${baseClasses} ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
