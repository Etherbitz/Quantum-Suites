interface ComplianceDropAlert {
  previousScore: number;
  currentScore: number;
  delta: number;
  severity: "warning" | "critical";
}

/**
 * Returns a compliance drop alert when the score decreases beyond the threshold.
 */
export function evaluateComplianceDropAlert(
  currentScore: number,
  previousScore: number,
  dropThreshold: number
): ComplianceDropAlert | null {
  const delta = currentScore - previousScore;

  if (delta >= -dropThreshold) return null;

  const severity = delta <= -15 ? "critical" : "warning";

  return {
    previousScore,
    currentScore,
    delta,
    severity,
  };
}
