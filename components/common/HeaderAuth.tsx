"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/gtag";

export function HeaderAuth() {
  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm">
      <SignedOut>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1.5 text-center text-xs font-medium text-neutral-200 hover:bg-neutral-900 sm:text-sm"
          onClick={() =>
            trackEvent("signup_cta_click", {
              location: "header_sign_in",
            })
          }
        >
          Sign in
        </Link>
        <Link
          href="/scan"
          className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 px-4 py-1.5 text-center text-xs font-semibold text-white shadow-[0_12px_35px_rgba(37,99,235,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(37,99,235,0.9)] sm:text-sm"
          onClick={() =>
            trackEvent("signup_cta_click", {
              location: "header_start_free",
            })
          }
        >
          Start free
        </Link>
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 border border-neutral-700 shadow-sm",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              href="/dashboard"
              label="Dashboard"
              labelIcon={
                <span className="inline-block h-4 w-4 rounded-sm bg-blue-500" />
              }
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </div>
  );
}
