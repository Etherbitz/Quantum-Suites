"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold">
          Sign in to Quantum Suites
        </h1>

        <p className="mb-6 text-sm text-neutral-400">
          Access your scans, reports, and usage history
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
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>
    </main>
  );
}
