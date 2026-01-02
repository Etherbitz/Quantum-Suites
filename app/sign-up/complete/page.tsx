import { Suspense } from "react";
import SignUpCompleteClient from "./SignUpCompleteClient";

export const dynamic = "force-dynamic";

export default function SignUpCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-xl text-center">
            <h1 className="text-2xl font-semibold mb-3">
              Setting up your account
            </h1>
            <p className="text-sm text-neutral-400">
              Please wait while we prepare everything for you...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
            </div>
          </div>
        </main>
      }
    >
      <SignUpCompleteClient />
    </Suspense>
  );
}
