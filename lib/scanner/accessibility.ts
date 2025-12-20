/**
 * Accessibility Scanner
 *
 * Performs WCAG 2.1/2.2 Level A/AA compliance checks.
 */

import type { ScanIssue, PageContent } from "@/lib/scanner/types";
import { WebsiteAnalyzer } from "@/lib/scanner/analyzer";

export class AccessibilityScanner {
  private analyzer = new WebsiteAnalyzer();

  async scan(pageContent: PageContent): Promise<ScanIssue[]> {
    const issues: ScanIssue[] = [];
    const parsed = this.analyzer.parseDOM(pageContent.html);

    issues.push(...this.checkImageAltText(parsed.images));
    issues.push(...this.checkDocumentLanguage(parsed));
    issues.push(...this.checkHeadingStructure(parsed.headings));
    issues.push(...this.checkFormLabels(parsed.forms));
    issues.push(...this.checkPageTitle(parsed.title));
    issues.push(...this.checkLinks(parsed.links));

    return issues;
  }

  private checkImageAltText(images: Array<{ alt?: string; src: string }>): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const missingAlt = images.filter((img) => img.alt === undefined);

    if (missingAlt.length > 0) {
      issues.push({
        id: "wcag-1.1.1-alt-text",
        category: "Accessibility",
        severity: missingAlt.length > 5 ? "critical" : "warning",
        title: "Images missing alternative text",
        message: `${missingAlt.length} image(s) lack alt attributes`,
        description:
          "All images must have alt text to be accessible to screen readers and assistive technologies.",
        regulation: "WCAG 2.2 Level A (1.1.1 Non-text Content)",
        regulationCode: "WCAG-2.2-1.1.1",
        regulationVersion: "2.2",
        fix: "Add descriptive alt attributes to all images. Use alt='' for decorative images.",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
      });
    }

    return issues;
  }

  private checkDocumentLanguage(parsed: { hasLang: boolean; lang?: string }): ScanIssue[] {
    const issues: ScanIssue[] = [];

    if (!parsed.hasLang) {
      issues.push({
        id: "wcag-3.1.1-lang-attribute",
        category: "Accessibility",
        severity: "warning",
        title: "Missing language declaration",
        message: "HTML element does not have a lang attribute",
        description: "Screen readers need the language attribute to pronounce content correctly.",
        regulation: "WCAG 2.2 Level A (3.1.1 Language of Page)",
        regulationCode: "WCAG-2.2-3.1.1",
        regulationVersion: "2.2",
        fix: 'Add lang attribute to <html> tag: <html lang="en">',
        url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html",
      });
    }

    return issues;
  }

  private checkHeadingStructure(headings: Array<{ level: number; text: string }>): ScanIssue[] {
    const issues: ScanIssue[] = [];

    if (headings.length === 0) {
      issues.push({
        id: "wcag-2.4.6-headings",
        category: "Accessibility",
        severity: "warning",
        title: "No headings found",
        message: "Page has no heading elements",
        description:
          "Headings provide structure and navigation landmarks for screen reader users.",
        regulation: "WCAG 2.2 Level AA (2.4.6 Headings and Labels)",
        regulationCode: "WCAG-2.2-2.4.6",
        regulationVersion: "2.2",
        fix: "Add proper heading structure starting with <h1> for main content.",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html",
      });
      return issues;
    }

    const hasH1 = headings.some((h) => h.level === 1);
    if (!hasH1) {
      issues.push({
        id: "wcag-h1-missing",
        category: "Accessibility",
        severity: "warning",
        title: "Missing H1 heading",
        message: "Page does not have an H1 heading",
        description: "Every page should have exactly one H1 heading that describes the main content.",
        regulation: "WCAG 2.2 Level AA (2.4.6 Headings and Labels)",
        regulationCode: "WCAG-2.2-2.4.6",
        regulationVersion: "2.2",
        fix: "Add an <h1> element to identify the page's main topic.",
      });
    }

    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      if (diff > 1) {
        issues.push({
          id: "wcag-heading-skip",
          category: "Accessibility",
          severity: "info",
          title: "Heading level skipped",
          message: `Heading jumps from H${headings[i - 1].level} to H${headings[i].level}`,
          description: "Heading levels should not be skipped to maintain proper document structure.",
          regulation: "WCAG 2.2 Best Practice",
          regulationCode: "WCAG-2.2-structure",
          regulationVersion: "2.2",
          fix: "Use sequential heading levels (h1 > h2 > h3) without skipping.",
        });
        break;
      }
    }

    return issues;
  }

  private checkFormLabels(forms: Array<{ inputs: number; hasLabels: boolean }>): ScanIssue[] {
    const issues: ScanIssue[] = [];

    const formsWithoutLabels = forms.filter((f) => !f.hasLabels);
    if (formsWithoutLabels.length > 0) {
      issues.push({
        id: "wcag-1.3.1-form-labels",
        category: "Accessibility",
        severity: "critical",
        title: "Form inputs without labels",
        message: `${formsWithoutLabels.length} form(s) have inputs without associated labels`,
        description: "Form inputs must have labels so screen reader users know what information to provide.",
        regulation: "WCAG 2.2 Level A (1.3.1 Info and Relationships)",
        regulationCode: "WCAG-2.2-1.3.1",
        regulationVersion: "2.2",
        fix: 'Use <label for="inputId"> or wrap inputs with <label> elements.',
        url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
      });
    }

    return issues;
  }

  private checkPageTitle(title?: string): ScanIssue[] {
    const issues: ScanIssue[] = [];

    if (!title || title.trim().length === 0) {
      issues.push({
        id: "wcag-2.4.2-page-title",
        category: "Accessibility",
        severity: "critical",
        title: "Missing or empty page title",
        message: "Page does not have a descriptive title",
        description:
          "Page titles help users understand what page they're on and are essential for navigation.",
        regulation: "WCAG 2.2 Level A (2.4.2 Page Titled)",
        regulationCode: "WCAG-2.2-2.4.2",
        regulationVersion: "2.2",
        fix: "Add a descriptive <title> element in the <head> section.",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html",
      });
    }

    return issues;
  }

  private checkLinks(links: Array<{ href: string; text: string }>): ScanIssue[] {
    const issues: ScanIssue[] = [];

    const emptyLinks = links.filter((link) => !link.text || link.text.trim().length === 0);

    if (emptyLinks.length > 0) {
      issues.push({
        id: "wcag-2.4.4-link-purpose",
        category: "Accessibility",
        severity: "warning",
        title: "Links with empty text",
        message: `${emptyLinks.length} link(s) have no text content`,
        description:
          "Screen reader users need descriptive link text to understand where links lead.",
        regulation: "WCAG 2.2 Level A (2.4.4 Link Purpose)",
        regulationCode: "WCAG-2.2-2.4.4",
        regulationVersion: "2.2",
        fix: "Add descriptive text to links or use aria-label for icon-only links.",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html",
      });
    }

    return issues;
  }
}
