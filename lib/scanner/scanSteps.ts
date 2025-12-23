export const SCAN_STEPS = [
  { key: "fetch", label: "Fetching website content", progress: 10 },
  { key: "seo", label: "Analyzing SEO configuration", progress: 30 },
  { key: "accessibility", label: "Checking accessibility standards", progress: 50 },
  { key: "compliance", label: "Evaluating compliance rules", progress: 70 },
  { key: "scoring", label: "Calculating compliance score", progress: 90 },
  { key: "complete", label: "Finalizing results", progress: 100 },
] as const;

export type ScanStepKey = typeof SCAN_STEPS[number]["key"];
