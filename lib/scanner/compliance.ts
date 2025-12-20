/**
 * Compliance & Security Scanner
 * 
 * Checks for GDPR basics, cookie consent, privacy policy, and common security headers.
 */

import type { ScanIssue, PageContent } from "@/lib/scanner/types";
import { WebsiteAnalyzer } from "@/lib/scanner/analyzer";

interface HeaderCheck {
  header: string;
  description: string;
  regulation: string;
  fix: string;
}

const SECURITY_HEADERS: HeaderCheck[] = [
  {
    header: "strict-transport-security",
    description: "Missing HSTS header for HTTPS enforcement",
    regulation: "RFC 6797 / Security best practice",
    fix: "Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
  },
  {
    header: "content-security-policy",
    description: "Missing Content-Security-Policy to mitigate XSS",
    regulation: "OWASP ASVS / Security best practice",
    fix: "Define a CSP restricting scripts, styles, images, and frames to trusted sources.",
  },
  {
    header: "x-frame-options",
    description: "Missing clickjacking protection",
    regulation: "OWASP ASVS / Security best practice",
    fix: "Add X-Frame-Options: DENY (or SAMEORIGIN if needed).",
  },
  {
    header: "x-content-type-options",
    description: "Missing MIME sniffing protection",
    regulation: "OWASP ASVS / Security best practice",
    fix: "Add X-Content-Type-Options: nosniff",
  },
];

export class ComplianceScanner {
  private analyzer = new WebsiteAnalyzer();

  scan(pageContent: PageContent): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const parsed = this.analyzer.parseDOM(pageContent.html);

    issues.push(...this.checkHttps(pageContent.url));
    issues.push(...this.checkSecurityHeaders(pageContent.headers));
    issues.push(...this.checkCookieConsent(pageContent.html));
    issues.push(...this.checkPrivacyPolicy(parsed.links));
    issues.push(...this.checkContact(parsed.links));

    return issues;
  }

  private checkHttps(url: string): ScanIssue[] {
    if (!url.startsWith("https://")) {
      return [
        {
          id: "compliance-ssl",
          category: "Security",
          severity: "critical",
          title: "Site is not using HTTPS",
          message: "The site should enforce HTTPS to protect user data in transit.",
          description:
            "Lack of HTTPS exposes users to man-in-the-middle attacks and fails modern compliance baselines.",
          regulation: "Baseline Security / GDPR Article 32 (security of processing)",
          regulationCode: "BASELINE-HTTPS",
          regulationVersion: "1.0",
          fix: "Force HTTPS with certificates, redirects, and HSTS.",
        },
      ];
    }
    return [];
  }

  private checkSecurityHeaders(headers: Record<string, string>): ScanIssue[] {
    const normalized: Record<string, string> = {};
    Object.keys(headers || {}).forEach((key) => {
      normalized[key.toLowerCase()] = headers[key];
    });

    const issues: ScanIssue[] = [];

    for (const rule of SECURITY_HEADERS) {
      if (!normalized[rule.header]) {
        issues.push({
          id: `header-${rule.header}`,
          category: "Security",
          severity: "warning",
          title: `Missing ${rule.header} header`,
          message: rule.description,
          description: rule.description,
          regulation: rule.regulation,
          regulationCode: `SEC-${rule.header}`.toUpperCase(),
          regulationVersion: "1.0",
          fix: rule.fix,
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
        });
      }
    }

    return issues;
  }

  private checkCookieConsent(html: string): ScanIssue[] {
    const hasCookieText = /cookie/i.test(html);
    const hasConsentKeywords = /consent|accept cookies|manage cookies/i.test(html);

    if (!hasCookieText || !hasConsentKeywords) {
      return [
        {
          id: "gdpr-cookie-consent",
          category: "GDPR",
          severity: "warning",
          title: "Cookie consent banner not detected",
          message: "No clear evidence of a cookie consent mechanism on the page.",
          description:
            "Sites serving EU/EEA users must present a cookie consent mechanism before non-essential cookies load.",
          regulation: "GDPR / ePrivacy",
          regulationCode: "GDPR-COOKIE-CONSENT",
          regulationVersion: "2016",
          fix: "Implement a consent banner that blocks non-essential cookies until approved.",
        },
      ];
    }

    return [];
  }

  private checkPrivacyPolicy(
    links: Array<{ href: string; text: string }>
  ): ScanIssue[] {
    const hasPrivacyLink = links.some((link) =>
      /privacy/i.test(link.href) || /privacy/i.test(link.text)
    );

    if (!hasPrivacyLink) {
      return [
        {
          id: "gdpr-privacy-policy",
          category: "Privacy",
          severity: "warning",
          title: "Privacy policy not found",
          message: "No visible link to a privacy policy.",
          description:
            "A clear privacy notice is required to inform users about data collection and rights.",
          regulation: "GDPR Articles 12-14",
          regulationCode: "GDPR-PRIVACY-NOTICE",
          regulationVersion: "2016",
          fix: "Add a prominently linked privacy policy page accessible from all pages.",
        },
      ];
    }

    return [];
  }

  private checkContact(
    links: Array<{ href: string; text: string }>
  ): ScanIssue[] {
    const hasContact = links.some((link) =>
      /contact/i.test(link.href) || /contact/i.test(link.text)
    );

    if (!hasContact) {
      return [
        {
          id: "gdpr-contact",
          category: "GDPR",
          severity: "info",
          title: "Contact information not found",
          message: "No contact link detected for data requests.",
          description:
            "GDPR requires a way for users to contact the controller for data requests and questions.",
          regulation: "GDPR Articles 12-14",
          regulationCode: "GDPR-CONTACT",
          regulationVersion: "2016",
          fix: "Provide a contact or data request page/link in the footer.",
        },
      ];
    }

    return [];
  }
}
