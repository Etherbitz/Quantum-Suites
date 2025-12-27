"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Top nav (simple, product focused) */}
      <header className="border-b border-neutral-900/80 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-white/90 hover:text-white"
          >
            Quantum Suites AI
          </Link>

          <nav className="flex items-center gap-4 text-xs text-neutral-400 sm:text-sm">
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/scan" className="hover:text-white">
              Run a scan
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center gap-10 px-6 py-10 md:flex-row md:items-stretch">
        {/* Left column: narrative + trust */}
        <div className="w-full max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure workspace sign-in</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Unlock your full compliance report
              </span>
            </h1>
            <p className="max-w-md text-sm text-neutral-300 sm:text-base">
              Create a secure workspace for your scans so you can run
              detailed compliance checks, save history, and unlock
              monitoring and alerts as you grow.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-xs text-neutral-300 sm:text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Why you need an account
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>
                  We save each scan so you can compare results over time and
                  export reports when you need them.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>
                  You get a clear compliance score plus grouped issues by
                  severity and regulation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>
                  Future scans are faster and unlock monitoring, alerts, and
                  AI-assisted recommendations as you upgrade.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a
              href="#signin-form"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-linear-to-r from-sky-400 to-cyan-500 px-6 py-3 text-sm font-semibold text-neutral-950 shadow-[0_0_40px_rgba(56,189,248,0.45)] transition hover:scale-[1.02] hover:shadow-[0_0_55px_rgba(56,189,248,0.6)]"
            >
              Sign in to continue
            </a>
            <Link
              href="/sign-up"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950/60 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(15,23,42,0.7)] transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Create a free account
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            No credit card required for the free tier. You can upgrade later
            if you need monitoring, alerts, or team access.
          </p>
        </div>

        {/* Right column: actual Clerk sign-in */}
        <div
          id="signin-form"
          className="w-full max-w-md rounded-2xl border border-neutral-800/80 bg-neutral-950/80 p-6 shadow-[0_0_35px_rgba(15,23,42,0.9)] backdrop-blur"
        >
          <h2 className="mb-2 text-lg font-semibold sm:text-xl">
            Sign in to Quantum Suites
          </h2>
          <p className="mb-4 text-xs text-neutral-400 sm:text-sm">
            Use email, passkey, or social login. Once you&apos;re in, we&apos;ll
            take you straight back to your latest scan.
          </p>

          <SignIn
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "bg-white text-black hover:bg-neutral-200 transition",
                formFieldInput:
                  "bg-neutral-900 border border-neutral-800 text-white",
                footerActionText: "text-neutral-400",
                footerActionLink: "text-white hover:underline",
                socialButtonsBlockButton:
                  "bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-neutral-800",
                dividerText: "text-neutral-500",
              },
            }}
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
          />
        </div>
      </section>
    </main>
  );
}
