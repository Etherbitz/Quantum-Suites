"use client";

import { useState } from "react";
import type { Plan } from "@/lib/plans";

export function NextActionsStepper({
  issues,
  plan,
}: {
  issues: string[];
  plan: Plan;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!issues || issues.length === 0) return null;

  const currentIssue = issues[currentIndex];
  const remaining = issues.slice(currentIndex + 1);
  const isLast = currentIndex === issues.length - 1;

  return (
    <div className="space-y-3 text-[11px]">
      <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
          Step {currentIndex + 1} of {issues.length}
        </p>
        <p className="mt-1 font-medium text-emerald-50">
          Start with this:
        </p>
        <p className="mt-1 text-emerald-100/90">{currentIssue}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isLast) setCurrentIndex((idx) => Math.min(idx + 1, issues.length - 1));
            }}
            disabled={isLast}
            className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-default disabled:bg-neutral-700 disabled:text-neutral-300 disabled:shadow-none"
         >
            {isLast ? "All priority steps completed" : "Mark step done & go next"}
          </button>

          {!isLast && (
            <p className="text-[10px] text-emerald-200/80">
              Working through these will steadily raise your score.
            </p>
          )}
        </div>
      </div>

      {remaining.length > 0 && (
        <div className="space-y-1.5 text-neutral-200">
          <p className="text-[10px] font-medium text-neutral-400">
            Up next
          </p>
          <ul className="space-y-1.5">
            {remaining.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-neutral-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(plan === "free" || plan === "starter") && (
        <p className="mt-1 text-[10px] text-amber-400">
          Upgrade to Business to turn these into monitored issues with continuous rescans and change alerts.
        </p>
      )}
    </div>
  );
}
