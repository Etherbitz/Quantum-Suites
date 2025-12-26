/**
 * Scanner Types
 *
 * Defines all types used across the scanning engine.
 */

export type Severity = "critical" | "warning" | "info";

export type ComplianceCategory =
  | "Accessibility"
  | "GDPR"
  | "Security"
  | "Privacy"
  | "Performance"
  | "SEO";

export interface ScanIssue {
  id: string;
  category: ComplianceCategory;
  severity: Severity;
  title: string;
  message: string;
  description: string;
  regulation?: string; // e.g., "WCAG 2.1 Level A", "GDPR Article 13"
  regulationCode?: string; // stable rule code e.g., "WCAG-2.1-1.1.1"
  regulationVersion?: string; // e.g., "2.1", "2.2"
  fix?: string;
  element?: string; // CSS selector or element description
  url?: string; // Documentation URL
  /** Optional HTML snippet and approximate line number for "Review code" views. */
  snippetHtml?: string;
  snippetLine?: number;
}

export interface ScanResult {
  url: string;
  score: number; // 0-100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  issues: ScanIssue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
  scannedAt: Date;
  regulationsChecked: string[];
}

export interface PageContent {
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  responseTime: number;
  url: string;
}
