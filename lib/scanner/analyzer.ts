/**
 * Website Analyzer
 *
 * Fetches and parses website content for scanning.
 */

import type { PageContent } from "@/lib/scanner/types";

export class WebsiteAnalyzer {
  private timeout: number = 15000; // 15 seconds timeout safeguard

  async fetchPage(url: string): Promise<PageContent> {
    const startTime = Date.now();

    try {
      const normalizedUrl = url.startsWith("http://")
        ? url.replace("http://", "https://")
        : url.startsWith("http")
          ? url
          : `https://${url}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(normalizedUrl, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`FETCH_FAILED_${response.status}`);
      }

      const html = await response.text();
      const responseTime = Date.now() - startTime;

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        html,
        statusCode: response.status,
        headers,
        responseTime,
        url: response.url,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw new Error(
        `Failed to fetch ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  parseDOM(html: string): {
    images: Array<{ alt?: string; src: string }>;
    links: Array<{ href: string; text: string }>;
    forms: Array<{ inputs: number; hasLabels: boolean }>;
    headings: Array<{ level: number; text: string }>;
    hasDoctype: boolean;
    hasLang: boolean;
    lang?: string;
    title?: string;
    metaTags: Array<{ name: string; content: string }>;
  } {
    const images = this.extractImages(html);
    const links = this.extractLinks(html);
    const forms = this.extractForms(html);
    const headings = this.extractHeadings(html);
    const hasDoctype = /<!DOCTYPE html>/i.test(html);
    const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    const hasLang = !!langMatch;
    const lang = langMatch?.[1];
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch?.[1];
    const metaTags = this.extractMetaTags(html);

    return {
      images,
      links,
      forms,
      headings,
      hasDoctype,
      hasLang,
      lang,
      title,
      metaTags,
    };
  }

  private extractImages(html: string): Array<{ alt?: string; src: string }> {
    const imgRegex = /<img[^>]*>/gi;
    const matches = html.match(imgRegex) || [];

    return matches.map((img) => {
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      const altMatch = img.match(/alt=["']([^"']*)["']/i);

      return {
        src: srcMatch?.[1] || "",
        alt: altMatch?.[1],
      };
    });
  }

  private extractLinks(html: string): Array<{ href: string; text: string }> {
    const linkRegex = /<a[^>]*>.*?<\/a>/gi;
    const matches = html.match(linkRegex) || [];

    return matches.map((link) => {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      const textMatch = link.match(/>([^<]+)</);

      return {
        href: hrefMatch?.[1] || "",
        text: textMatch?.[1]?.trim() || "",
      };
    });
  }

  private extractForms(html: string): Array<{ inputs: number; hasLabels: boolean }> {
    const formRegex = /<form[^>]*>[\s\S]*?<\/form>/gi;
    const matches = html.match(formRegex) || [];

    return matches.map((form) => {
      const inputs = (form.match(/<input[^>]*>/gi) || []).length;
      const labels = (form.match(/<label[^>]*>/gi) || []).length;

      return {
        inputs,
        hasLabels: labels > 0,
      };
    });
  }

  private extractHeadings(html: string): Array<{ level: number; text: string }> {
    // Allow nested markup inside headings and strip tags to get readable text
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const headings: Array<{ level: number; text: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(html)) !== null) {
      const innerHtml = match[2] ?? "";
      const text = innerHtml
        .replace(/<[^>]+>/g, " ") // strip tags
        .replace(/\s+/g, " ")
        .trim();

      if (!text) continue;

      headings.push({
        level: parseInt(match[1], 10),
        text,
      });
    }

    return headings;
  }

  private extractMetaTags(html: string): Array<{ name: string; content: string }> {
    const metaRegex = /<meta[^>]*>/gi;
    const matches = html.match(metaRegex) || [];

    return matches
      .map((meta) => {
        const nameMatch =
          meta.match(/name=["']([^"']+)["']/i) ||
          meta.match(/property=["']([^"']+)["']/i);
        const contentMatch = meta.match(/content=["']([^"']+)["']/i);

        if (nameMatch && contentMatch) {
          return {
            name: nameMatch[1],
            content: contentMatch[1],
          };
        }
        return null;
      })
      .filter((tag): tag is { name: string; content: string } => tag !== null);
  }
}
