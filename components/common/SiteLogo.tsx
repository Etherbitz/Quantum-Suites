"use client";

import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      aria-label="Quantum Suites AI home"
      className="inline-flex items-center gap-3 rounded-full bg-transparent px-1 py-0.5 text-white transition hover:scale-[1.02] hover:drop-shadow-[0_0_18px_rgba(6,182,212,0.55)]"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-linear-to-br from-blue-500 via-sky-500 to-cyan-400 p-1 shadow-lg shadow-blue-900/60">
        <span className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
          <span className="rounded-[0.5rem] bg-blue-500" />
          <span className="rounded-[0.5rem] bg-cyan-400" />
          <span className="rounded-[0.5rem] bg-blue-600" />
          <span className="rounded-[0.5rem] bg-sky-500" />
        </span>
      </span>

      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight text-white">
          Quantum
        </span>
        <span className="text-[11px] font-medium tracking-tight text-white">
          Suites <span className="text-cyan-400">AI</span>
        </span>
      </span>
    </Link>
  );
}
