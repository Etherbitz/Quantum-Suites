import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteLogo } from "@/components/common/SiteLogo";
import { HeaderAuth } from "@/components/common/HeaderAuth";
import { CookieBanner } from "@/components/common/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Quantum Suites AI – Automated Website Compliance & Risk Monitoring",
    template: "%s | Quantum Suites AI",
  },
  description:
    "Automated website accessibility, privacy, and security scanning with daily monitoring, alerts, and audit-ready reports.",
  metadataBase: new URL("https://www.quantumsuites-ai.com"),
  alternates: {
    canonical: "https://www.quantumsuites-ai.com",
  },
  openGraph: {
    title: "Quantum Suites AI – Automated Website Compliance & Risk Monitoring",
    description:
      "See your compliance risk score, track changes over time, and export client-ready reports.",
    url: "https://www.quantumsuites-ai.com",
    siteName: "Quantum Suites AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Suites AI – Automated Website Compliance & Risk Monitoring",
    description:
      "Automated website compliance checks with daily monitoring, alerts, and exportable reports.",
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
          <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <SiteLogo />

              <nav className="hidden items-center gap-6 text-xs text-neutral-400 sm:text-sm md:flex">
                <Link
                  href="/#how-it-works"
                  className="hover:text-white"
                >
                  How it works
                </Link>
                <Link
                  href="/#pricing"
                  className="hover:text-white"
                >
                  Pricing
                </Link>
                <Link
                  href="/scan"
                  className="hover:text-white"
                >
                  Run a scan
                </Link>
              </nav>

              <HeaderAuth />
            </div>
          </header>
          {children}
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
