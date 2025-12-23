"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function HeaderAuth() {
  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm">
      <SignedOut>
        <Link
          href="/sign-in"
          className="hidden text-neutral-400 hover:text-white md:inline"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/40 transition hover:bg-blue-500 hover:shadow-blue-400/60 sm:text-sm"
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
