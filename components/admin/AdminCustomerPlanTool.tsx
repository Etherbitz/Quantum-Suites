"use client";

import { useState } from "react";
import type { Plan } from "@/lib/plans";

const ALLOWED_PLANS: Plan[] = ["free", "starter", "business", "agency"];

type IdentifierType = "email" | "id" | "clerkId";

interface AdminCustomerPlanToolProps {
  initialIdentifierType?: IdentifierType;
  initialIdentifier?: string;
}

export function AdminCustomerPlanTool({
  initialIdentifierType = "email",
  initialIdentifier = "",
}: AdminCustomerPlanToolProps) {
  const [identifierType, setIdentifierType] = useState<IdentifierType>(
    initialIdentifierType
  );
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("starter");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const body: any = { plan: selectedPlan };
      if (identifierType === "email") body.email = identifier.trim();
      if (identifierType === "id") body.id = identifier.trim();
      if (identifierType === "clerkId") body.clerkId = identifier.trim();

      const res = await fetch("/api/admin/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Could not update customer plan.");
        return;
      }

      setMessage(
        `Updated ${data.user.email || data.user.id} to ${data.user.plan}.`
      );
    } catch {
      setError("Unexpected error updating customer plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-50">
            Admin: change customer tier
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Look up a customer by email, user ID, or Clerk ID and override
            their subscription tier directly.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Identifier
          </label>
          <select
            value={identifierType}
            onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
          >
            <option value="email">Email</option>
            <option value="id">User ID</option>
            <option value="clerkId">Clerk ID</option>
          </select>
        </div>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={
            identifierType === "email"
              ? "customer@example.com"
              : identifierType === "id"
              ? "User id from database"
              : "Clerk user id"
          }
          className="min-w-64 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500"
        />
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
          disabled={loading || !identifier.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update customer"}
        </button>

        {message && (
          <span className="text-emerald-300">{message}</span>
        )}
        {error && <span className="text-red-400">{error}</span>}
      </div>
    </div>
  );
}
