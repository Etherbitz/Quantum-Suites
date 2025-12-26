"use client";

import { useState } from "react";
import type { Plan } from "@/lib/plans";

type AdminPlanToolProps = {
  currentPlan: Plan | string;
};

const ALLOWED_PLANS: Plan[] = ["free", "starter", "business", "agency"];

export function AdminPlanTool({ currentPlan }: AdminPlanToolProps) {
  const normalized = (currentPlan || "free").toLowerCase() as Plan | string;
  const initialPlan = (ALLOWED_PLANS.includes(normalized as Plan)
    ? (normalized as Plan)
    : "starter") as Plan;

  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);
  const [effectivePlan, setEffectivePlan] = useState<Plan | string>(normalized);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not update plan.");
        return;
      }

      const updatedPlan = (data?.plan || selectedPlan) as Plan;
      setEffectivePlan(updatedPlan);
      setMessage(`Plan updated to ${updatedPlan}.`);
    } catch (err) {
      setError("Unexpected error updating plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-50">
            Admin: change my tier
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Quickly switch your own account between test tiers. This bypasses
            Stripe and is only available to admins.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          Current: {String(effectivePlan || "free").toLowerCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {ALLOWED_PLANS.map((plan) => {
          const isActive = selectedPlan === plan;
          return (
            <button
              key={plan}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-full px-3 py-1 font-medium transition border text-xs ${
                isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-100"
                  : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-500"
              }`}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update plan"}
        </button>

        {message && (
          <span className="text-emerald-300">{message}</span>
        )}
        {error && (
          <span className="text-red-400">{error}</span>
        )}
      </div>
    </div>
  );
}
