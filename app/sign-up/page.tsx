"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold">
          Create your Quantum Suites account
        </h1>

        <p className="mb-6 text-sm text-neutral-400">
          Start scanning and optimizing instantly
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
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </main>
  );
}
