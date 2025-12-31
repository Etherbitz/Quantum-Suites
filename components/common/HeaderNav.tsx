"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function HeaderNav() {
  return (
    <nav className="hidden items-center gap-6 text-xs text-neutral-400 sm:text-sm md:flex">
      <SignedOut>
        <Link href="/#how-it-works" className="hover:text-white">
          How it works
        </Link>
        <Link href="/pricing" className="hover:text-white">
          Pricing
        </Link>
        <Link href="/scan" className="hover:text-white">
          Run a scan
        </Link>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard" className="hover:text-white">
          Dashboard
        </Link>
        <Link href="/scan" className="hover:text-white">
          New scan
        </Link>
        <Link href="/dashboard/alerts" className="hover:text-white">
          Alerts
        </Link>
        <Link href="/dashboard/reports" className="hover:text-white">
          Reports
        </Link>
      </SignedIn>
    </nav>
  );
}
