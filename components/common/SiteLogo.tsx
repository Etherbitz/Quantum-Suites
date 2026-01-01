"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function SiteLogo() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-transparent px-1 py-0.5 text-white">
      {/* Logo icon: goes to dashboard if signed in, auth if signed out */}
      <SignedIn>
        <Link
          href="/dashboard"
          aria-label="Go to dashboard"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-linear-to-br from-blue-500 via-sky-500 to-cyan-400 p-1 shadow-lg shadow-blue-900/60 transition hover:scale-[1.03] hover:drop-shadow-[0_0_18px_rgba(6,182,212,0.55)]"
        >
          <span className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            <span className="rounded-lg bg-blue-500" />
            <span className="rounded-lg bg-cyan-400" />
            <span className="rounded-lg bg-blue-600" />
            <span className="rounded-lg bg-sky-500" />
          </span>
        </Link>
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          aria-label="Sign in or sign up"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-linear-to-br from-blue-500 via-sky-500 to-cyan-400 p-1 shadow-lg shadow-blue-900/60 transition hover:scale-[1.03] hover:drop-shadow-[0_0_18px_rgba(6,182,212,0.55)]"
        >
          <span className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            <span className="rounded-lg bg-blue-500" />
            <span className="rounded-lg bg-cyan-400" />
            <span className="rounded-lg bg-blue-600" />
            <span className="rounded-lg bg-sky-500" />
          </span>
        </Link>
      </SignedOut>

      {/* Brand text: always returns to marketing homepage */}
      <Link
        href="/"
        aria-label="Quantum Suites AI home"
        className="hidden flex-col leading-tight transition hover:opacity-90 sm:flex"
      >
        <span className="text-sm font-semibold tracking-tight text-white">
          Quantum
        </span>
        <span className="text-[11px] font-medium tracking-tight text-white">
          Suites <span className="text-cyan-400">AI</span>
        </span>
      </Link>
    </div>
  );
}
