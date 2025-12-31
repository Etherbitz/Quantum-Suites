"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-10 md:flex-row md:items-stretch">
        {/* Left: product value for new accounts */}
        <div className="w-full max-w-xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Step 2 of 2 · Create your workspace</span>
          </p>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Create your Quantum Suites account
              </span>
            </h1>
            <p className="max-w-md text-sm text-neutral-300 sm:text-base">
              In about a minute you&apos;ll have a live compliance score, a
              prioritized issues list, and a home for all future scans.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-xs text-neutral-300 sm:text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              With your free account you can
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>Run scans on your sites and save results automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>Export reports for stakeholders or auditors when needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <span>Track improvements over time as you fix accessibility and compliance gaps.</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-neutral-500">
            No credit card required to get started. Upgrade only if you want
            continuous monitoring, alerts, or team access.
          </p>
        </div>

        {/* Right: Clerk SignUp card */}
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6 shadow-[0_0_35px_rgba(15,23,42,0.9)] backdrop-blur">
          <h2 className="mb-2 text-lg font-semibold sm:text-xl">
            Create your account
          </h2>
          <p className="mb-4 text-xs text-neutral-400 sm:text-sm">
            Use your work email to keep scans and alerts tied to your
            organization.
          </p>

          <SignUp
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
            signInUrl="/sign-in"
            afterSignUpUrl={redirectUrl}
            afterSignInUrl={redirectUrl}
          />
        </div>
      </section>
    </main>
  );
}
