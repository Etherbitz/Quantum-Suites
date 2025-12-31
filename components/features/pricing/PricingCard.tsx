"use client";

import { CheckCircle2, Crown } from "lucide-react";
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
      className={`relative flex h-full min-w-[260px] flex-col rounded-2xl border p-8 transition-all duration-300 ${
        highlight
          ? "border-blue-500 bg-linear-to-b from-blue-50 via-white to-blue-50 shadow-xl md:min-h-115 md:scale-[1.03] hover:scale-[1.05] hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(37,99,235,0.5)]"
          : "border-gray-200 bg-white md:min-h-105 hover:border-blue-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md">
          <Crown className="h-6 w-8" />
          Best Value
        </div>
      )}

      <h3 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h3>

      <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
        {subtitle}
      </p>

      <p className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        {price}
      </p>

      <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-700">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-left">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
