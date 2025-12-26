"use client";

import { Crown } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";

export function PricingCard({
  title,
  price,
  subtitle,
  features,
  highlight,
  action,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 transition-all duration-300 ${
        highlight
          ? "border-blue-600 bg-blue-50 shadow-xl scale-[1.03] hover:scale-[1.05] hover:shadow-2xl"
          : "border-gray-200 bg-white hover:shadow-lg"
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md">
          <Crown className="h-6 w-8" />
          Best Value
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>

      <p className="mt-6 text-3xl font-bold text-gray-900">{price}</p>

      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>

      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
