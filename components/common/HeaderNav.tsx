"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

function closeNearestDetails(e: React.MouseEvent<HTMLElement>) {
  const details = e.currentTarget.closest("details");
  if (details instanceof HTMLDetailsElement) {
    details.open = false;
  }
}

function NavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const linkClassName =
    variant === "desktop"
      ? "hover:text-white"
      : "block rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900";

  const linkProps =
    variant === "mobile"
      ? { onClick: closeNearestDetails }
      : undefined;

  return (
    <>
      <SignedOut>
        <Link href="/#how-it-works" className={linkClassName} {...linkProps}>
          How it works
        </Link>
        <Link href="/pricing" className={linkClassName} {...linkProps}>
          Pricing
        </Link>
        <Link href="/scan" className={linkClassName} {...linkProps}>
          Run a scan
        </Link>
        {variant === "mobile" ? (
          <Link href="/sign-in" className={linkClassName} {...linkProps}>
            Sign in
          </Link>
        ) : null}
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard" className={linkClassName} {...linkProps}>
          Dashboard
        </Link>
        <Link href="/scan" className={linkClassName} {...linkProps}>
          New scan
        </Link>
        <Link href="/dashboard/alerts" className={linkClassName} {...linkProps}>
          Alerts
        </Link>
        <Link href="/dashboard/reports" className={linkClassName} {...linkProps}>
          Reports
        </Link>
      </SignedIn>
    </>
  );
}

export function HeaderNav() {
  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 text-xs text-neutral-400 sm:text-sm md:flex">
        <NavLinks variant="desktop" />
      </nav>

      {/* Mobile nav: compact dropdown */}
      <div className="relative md:hidden">
        <details className="group">
          <summary
            className="cursor-pointer list-none rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 [&::-webkit-details-marker]:hidden"
            aria-label="Open navigation menu"
          >
            Menu
          </summary>
          <div className="absolute left-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-950/95 p-2 shadow-lg shadow-black/30 backdrop-blur">
            <nav className="grid gap-1">
              <NavLinks variant="mobile" />
            </nav>
          </div>
        </details>
      </div>
    </>
  );
}
