import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { SiteLogo } from "@/components/common/SiteLogo";
import { HeaderAuth } from "@/components/common/HeaderAuth";
import "./globals.css";

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
        </body>
      </html>
    </ClerkProvider>
  );
}
