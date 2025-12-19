"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0b0f1a] to-[#0d1b2a] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(0,255,209,0.08),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(255,99,146,0.12),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(89,150,255,0.1),transparent_40%)]" />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-[0_20px_80px_rgba(0,0,0,0.35)] relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
          Start your journey
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold">
          Create your{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Quantum Suites
          </span>{" "}
          account
        </h1>

        <p className="mb-6 text-sm text-neutral-400">
          Start scanning and optimizing instantly
        </p>

        {clerkEnabled ? (
          <SignUp
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "bg-gradient-to-r from-emerald-300 to-cyan-400 text-black font-semibold hover:brightness-110 transition shadow-[0_10px_40px_rgba(0,255,179,0.35)]",
                formFieldInput:
                  "bg-white/5 border border-white/10 text-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/40",
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
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/sign-up/complete"
          />
        ) : (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-left">
              <p className="text-sm text-neutral-300">
                Live authentication is disabled in this environment. Add your Clerk
                API keys to enable sign-up.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="h-11 rounded-lg bg-white/10 border border-white/10 animate-pulse" />
              <div className="h-11 rounded-lg bg-white/10 border border-white/10 animate-pulse" />
              <div className="h-11 rounded-lg bg-gradient-to-r from-emerald-300 to-cyan-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
