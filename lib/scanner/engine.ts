/**
 * Scan Engine
 *
 * Orchestrates fetching, accessibility checks, compliance checks, scoring, and risk calculation.
 */

import { WebsiteAnalyzer } from "@/lib/scanner/analyzer";
import { AccessibilityScanner } from "@/lib/scanner/accessibility";
import { ComplianceScanner } from "@/lib/scanner/compliance";
import type { ScanIssue, ScanResult } from "@/lib/scanner/types";

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
    const penalties =
      summary.critical * 20 + summary.warning * 10 + summary.info * 2;
    return Math.max(0, 100 - penalties);
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
