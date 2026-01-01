import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLogo } from "@/components/common/SiteLogo";
import { HeaderAuth } from "@/components/common/HeaderAuth";
import { HeaderNav } from "@/components/common/HeaderNav";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { CookieBanner } from "@/components/common/CookieBanner";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import "./globals.css";

// Google Analytics + optional Google Ads configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-4T7KHB3VSW";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export const metadata: Metadata = {
  title: {
    default: "Quantum Suites AI | AI Website Scanning & Compliance Platform",
    template: "%s | Quantum Suites AI",
  },
  description:
    "Quantum Suites AI helps businesses scan, analyze, and improve their websites with AI-powered compliance, SEO, and performance insights.",
  metadataBase: new URL("https://www.quantumsuites-ai.com"),
  alternates: {
    canonical: "https://www.quantumsuites-ai.com",
  },
  openGraph: {
    title: "Quantum Suites AI | AI Website Scanning & Compliance Platform",
    description:
      "Quantum Suites AI helps businesses scan, analyze, and improve their websites with AI-powered compliance, SEO, and performance insights.",
    url: "https://www.quantumsuites-ai.com",
    siteName: "Quantum Suites AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Suites AI | AI Website Scanning & Compliance Platform",
    description:
      "Quantum Suites AI helps businesses scan, analyze, and improve their websites with AI-powered compliance, SEO, and performance insights.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-neutral-950 text-white">
          {/* Global analytics: GA4 page views on every route change */}
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>

          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              window.googleTranslateElementInit = function googleTranslateElementInit() {
                try {
                  if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
                  new window.google.translate.TranslateElement(
                    {
                      pageLanguage: 'en',
                      autoDisplay: false,
                      includedLanguages: 'en,es,fr,de,pt,it,ja,zh-CN'
                    },
                    'google_translate_element'
                  );
                } catch (e) {
                  // no-op
                }
              };
            `}
          </Script>
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />

          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { debug_mode: ${process.env.NODE_ENV === "development" ? "true" : "false"} });
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
            `}
          </Script>
          <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-3">
              <SiteLogo />
              <HeaderNav />

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <HeaderAuth />
              </div>
            </div>
          </header>
          {children}

          <footer className="border-t border-neutral-900 bg-neutral-950/95">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] sm:text-xs">
                © {new Date().getFullYear()} Quantum Suites AI. All rights reserved.
              </p>
              <nav className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs">
                <Link href="/privacy" className="hover:text-neutral-200">
                  Privacy policy
                </Link>
                <Link href="/terms" className="hover:text-neutral-200">
                  Terms of service
                </Link>
                <Link href="/contact" className="hover:text-neutral-200">
                  Contact
                </Link>
              </nav>
            </div>
          </footer>

          {/* Google Translate mounts here (kept hidden; we provide our own selector UI). */}
          <div id="google_translate_element" style={{ display: "none" }} />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}
