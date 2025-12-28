import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { SiteLogo } from "@/components/common/SiteLogo";
import { HeaderAuth } from "@/components/common/HeaderAuth";
import { HeaderNav } from "@/components/common/HeaderNav";
import { CookieBanner } from "@/components/common/CookieBanner";
import "./globals.css";

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
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-4T7KHB3VSW"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4T7KHB3VSW');
            `}
          </Script>
          <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <SiteLogo />
              <HeaderNav />

              <HeaderAuth />
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
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
