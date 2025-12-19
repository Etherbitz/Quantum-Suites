"use client";

import { useState } from "react";
import { PLANS } from "@/lib/plans";

export function UpgradeButton({
  plan,
  label,
}: {
  plan: "starter" | "business";
  label: string;
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

  return (
    <button
      onClick={upgrade}
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium
                 hover:bg-blue-700 active:scale-[0.98]
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition"
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
