/**
 * Compliance scoring utilities.
 *
 * This module centralizes all logic related to:
 * - Compliance score calculation
 * - Trend comparison
 * - Risk classification
 *
 * IMPORTANT:
 * - No UI concerns
 * - No database calls
 * - Pure, deterministic functions only
 */

export type ScoredEntity = {
  score: number | null;
  createdAt: Date | string;
};

/**
 * Calculate average compliance score from a list of scored entities.
 *
 * Rules:
 * - Ignores null scores (pending scans)
 * - Returns 0 if no valid scores exist
 * - Rounds to nearest integer
 */
export function calculateComplianceScore<T extends ScoredEntity>(
  items: T[]
): number {
  const validScores = items.filter(
    (item) => typeof item.score === "number"
  );

  if (validScores.length === 0) return 0;

  const total = validScores.reduce(
    (sum, item) => sum + (item.score ?? 0),
    0
  );

  return Math.round(total / validScores.length);
}

/**
 * Determine risk label and color class from a score.
 * Shared by dashboard, scan history, alerts, and reports.
 */
export function getComplianceRisk(score: number | null) {
  if (score === null) {
    return { label: "Pending", level: "pending" as const };
  }

  if (score >= 80) {
    return { label: "Low Risk", level: "low" as const };
  }

  if (score >= 50) {
    return { label: "Medium Risk", level: "medium" as const };
  }

  return { label: "High Risk", level: "high" as const };
}

/**
 * Compare two compliance scores and return trend direction.
 */
export function getComplianceTrend(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return { direction: "neutral" as const, delta: 0 };
  }

  const delta = current - previous;

  if (delta > 0) {
    return { direction: "up" as const, delta };
  }

  if (delta < 0) {
    return { direction: "down" as const, delta };
  }

  return { direction: "neutral" as const, delta: 0 };
}
