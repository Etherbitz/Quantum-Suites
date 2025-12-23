type ScanMetrics = {
  seo: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
};

export function calculateComplianceScore(metrics: ScanMetrics): number {
  const weights = {
    seo: 0.25,
    performance: 0.35,
    accessibility: 0.25,
    bestPractices: 0.15,
  };

  return Math.round(
    metrics.seo * weights.seo +
    metrics.performance * weights.performance +
    metrics.accessibility * weights.accessibility +
    metrics.bestPractices * weights.bestPractices
  );
}
