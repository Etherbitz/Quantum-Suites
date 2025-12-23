/**
 * Scan Engine
 *
 * Orchestrates fetching, accessibility checks, compliance checks, scoring, and risk calculation.
 */

import { WebsiteAnalyzer } from "@/lib/scanner/analyzer";
import { AccessibilityScanner } from "@/lib/scanner/accessibility";
import { ComplianceScanner } from "@/lib/scanner/compliance";
import type { ScanIssue, ScanResult } from "@/lib/scanner/types";

// Scoring configuration
const MAX_SCORE = 100;
const PENALTY_PER_CRITICAL = 12;
const PENALTY_PER_WARNING = 4;
const PENALTY_PER_INFO = 1;

// Caps prevent a single category from driving the score to zero
const MAX_CRITICAL_COUNT = 5; // beyond this, additional criticals don't reduce score further
const MAX_WARNING_COUNT = 10;
const MAX_INFO_COUNT = 25;

export class ScanEngine {
  private analyzer = new WebsiteAnalyzer();
  private accessibility = new AccessibilityScanner();
  private compliance = new ComplianceScanner();

  async scan(url: string): Promise<ScanResult> {
    const page = await this.analyzer.fetchPage(url);

    const accessibilityIssues = await this.accessibility.scan(page);
    const complianceIssues = this.compliance.scan(page);

    const issues = [...accessibilityIssues, ...complianceIssues];
    const summary = this.buildSummary(issues);
    const score = this.computeScore(summary);
    const riskLevel = this.computeRiskLevel(score, summary.critical);

    return {
      url: page.url,
      score,
      riskLevel,
      issues,
      summary,
      scannedAt: new Date(),
      regulationsChecked: [
        "WCAG 2.1 A/AA",
        "GDPR basics",
        "Security headers",
      ],
    };
  }

  private buildSummary(issues: ScanIssue[]): {
    critical: number;
    warning: number;
    info: number;
  } {
    return issues.reduce(
      (acc, issue) => {
        acc[issue.severity] += 1;
        return acc;
      },
      { critical: 0, warning: 0, info: 0 }
    );
  }

  private computeScore(summary: { critical: number; warning: number; info: number }): number {
    const criticalCount = Math.min(summary.critical, MAX_CRITICAL_COUNT);
    const warningCount = Math.min(summary.warning, MAX_WARNING_COUNT);
    const infoCount = Math.min(summary.info, MAX_INFO_COUNT);

    const penalties =
      criticalCount * PENALTY_PER_CRITICAL +
      warningCount * PENALTY_PER_WARNING +
      infoCount * PENALTY_PER_INFO;

    return Math.max(0, MAX_SCORE - penalties);
  }

  private computeRiskLevel(score: number, critical: number):
    | "Low"
    | "Medium"
    | "High"
    | "Critical" {
    if (critical > 0 || score < 40) return "Critical";
    if (score < 60) return "High";
    if (score < 80) return "Medium";
    return "Low";
  }
}
