"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0b0f1a] to-[#0d1b2a] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(89,150,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,255,209,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,99,146,0.08),transparent_35%)]" />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-[0_20px_80px_rgba(0,0,0,0.35)] relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
          Welcome back
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold">
          Sign in to{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
            Quantum Suites
          </span>
        </h1>

        <p className="mb-6 text-sm text-neutral-400">
          Access your scans, reports, and usage history
        </p>

        {clerkEnabled ? (
          <SignIn
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "bg-gradient-to-r from-cyan-300 to-blue-500 text-black font-semibold hover:brightness-110 transition shadow-[0_10px_40px_rgba(0,179,255,0.35)]",
                formFieldInput:
                  "bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/40",
                footerActionText: "text-neutral-400",
                footerActionLink: "text-white hover:underline",
                socialButtonsBlockButton:
                  "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/10",
                dividerText: "text-neutral-500",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
          />
        ) : (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-left">
              <p className="text-sm text-neutral-300">
                Live authentication is disabled in this environment. Add your Clerk
                API keys to enable sign-in.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="h-11 rounded-lg bg-white/10 border border-white/10 animate-pulse" />
              <div className="h-11 rounded-lg bg-white/10 border border-white/10 animate-pulse" />
              <div className="h-11 rounded-lg bg-gradient-to-r from-cyan-300 to-blue-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
