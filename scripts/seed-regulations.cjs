/* eslint-disable @typescript-eslint/no-require-imports */
/*
 * Seeds regulation and regulation rules for auditability.
 * Run: node scripts/seed-regulations.cjs
 */

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

// Use the same PG adapter configuration as the main app
// so Prisma works with the "client" engine type.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const regulations = [
  {
    name: "WCAG",
    version: "2.2",
    category: "Accessibility",
    description: "Web Content Accessibility Guidelines 2.2",
    sourceUrl: "https://www.w3.org/TR/WCAG22/",
    rules: [
      {
        code: "WCAG-2.2-1.1.1",
        version: "2.2",
        title: "Non-text Content",
        section: "1.1.1",
        description: "Provide text alternatives for non-text content.",
        category: "Accessibility",
        level: "A",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
      },
      {
        code: "WCAG-2.2-1.3.1",
        version: "2.2",
        title: "Info and Relationships",
        section: "1.3.1",
        description: "Information, structure, and relationships can be programmatically determined.",
        category: "Accessibility",
        level: "A",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
      },
      {
        code: "WCAG-2.2-2.4.2",
        version: "2.2",
        title: "Page Titled",
        section: "2.4.2",
        description: "Pages have titles that describe topic or purpose.",
        category: "Accessibility",
        level: "A",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html",
      },
      {
        code: "WCAG-2.2-2.4.4",
        version: "2.2",
        title: "Link Purpose",
        section: "2.4.4",
        description: "Link purpose is clear from its text or context.",
        category: "Accessibility",
        level: "A",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html",
      },
      {
        code: "WCAG-2.2-2.4.6",
        version: "2.2",
        title: "Headings and Labels",
        section: "2.4.6",
        description: "Headings and labels describe topic or purpose.",
        category: "Accessibility",
        level: "AA",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html",
      },
      {
        code: "WCAG-2.2-3.1.1",
        version: "2.2",
        title: "Language of Page",
        section: "3.1.1",
        description: "Default human language of each page can be programmatically determined.",
        category: "Accessibility",
        level: "A",
        sourceUrl: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html",
      },
    ],
  },
  {
    name: "GDPR",
    version: "2016",
    category: "Privacy",
    description: "General Data Protection Regulation",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    rules: [
      {
        code: "GDPR-COOKIE-CONSENT",
        version: "2016",
        title: "Cookie consent",
        section: "ePrivacy / GDPR",
        description: "Obtain consent before non-essential cookies are set.",
        category: "Privacy",
        level: "baseline",
        sourceUrl: "https://gdpr.eu/cookies/",
      },
      {
        code: "GDPR-PRIVACY-NOTICE",
        version: "2016",
        title: "Privacy notice",
        section: "Articles 12-14",
        description: "Provide clear and accessible privacy information to users.",
        category: "Privacy",
        level: "baseline",
        sourceUrl: "https://gdpr-info.eu/art-12-gdpr/",
      },
      {
        code: "GDPR-CONTACT",
        version: "2016",
        title: "Data controller contact",
        section: "Articles 12-14",
        description: "Provide contact method for data subjects to exercise rights.",
        category: "Privacy",
        level: "baseline",
        sourceUrl: "https://gdpr-info.eu/art-12-gdpr/",
      },
    ],
  },
  {
    name: "BASELINE-SECURITY",
    version: "1.0",
    category: "Security",
    description: "Baseline web security controls",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
    rules: [
      {
        code: "BASELINE-HTTPS",
        version: "1.0",
        title: "HTTPS enforcement",
        section: "Transport",
        description: "Serve all pages over HTTPS and enforce HSTS.",
        category: "Security",
        level: "baseline",
        sourceUrl: "https://https.cio.gov/",
      },
      {
        code: "SEC-STRICT-TRANSPORT-SECURITY",
        version: "1.0",
        title: "HSTS",
        section: "Header",
        description: "Strict-Transport-Security header configured.",
        category: "Security",
        level: "baseline",
        sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
      },
      {
        code: "SEC-CONTENT-SECURITY-POLICY",
        version: "1.0",
        title: "Content Security Policy",
        section: "Header",
        description: "Content-Security-Policy header restricts sources.",
        category: "Security",
        level: "baseline",
        sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy",
      },
      {
        code: "SEC-X-FRAME-OPTIONS",
        version: "1.0",
        title: "Clickjacking protection",
        section: "Header",
        description: "X-Frame-Options header set to DENY or SAMEORIGIN.",
        category: "Security",
        level: "baseline",
        sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
      },
      {
        code: "SEC-X-CONTENT-TYPE-OPTIONS",
        version: "1.0",
        title: "MIME sniffing protection",
        section: "Header",
        description: "X-Content-Type-Options header set to nosniff.",
        category: "Security",
        level: "baseline",
        sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      },
    ],
  },
];

async function seed() {
  for (const reg of regulations) {
    const regulation = await prisma.regulation.upsert({
      where: { name_version: { name: reg.name, version: reg.version } },
      create: {
        name: reg.name,
        version: reg.version,
        category: reg.category,
        description: reg.description,
        sourceUrl: reg.sourceUrl,
      },
      update: {
        category: reg.category,
        description: reg.description,
        sourceUrl: reg.sourceUrl,
      },
    });

    for (const rule of reg.rules) {
      await prisma.regulationRule.upsert({
        where: { code_version: { code: rule.code, version: rule.version } },
        create: {
          regulationId: regulation.id,
          code: rule.code,
          version: rule.version,
          title: rule.title,
          section: rule.section,
          description: rule.description,
          category: rule.category,
          level: rule.level,
          sourceUrl: rule.sourceUrl,
        },
        update: {
          regulationId: regulation.id,
          title: rule.title,
          section: rule.section,
          description: rule.description,
          category: rule.category,
          level: rule.level,
          sourceUrl: rule.sourceUrl,
        },
      });
    }
  }
}

seed()
  .then(() => {
    console.log("Regulations seeded");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
