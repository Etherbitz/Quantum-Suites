"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpCompletePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // If user is signed in, continue to dashboard
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-xl text-center">
        <h1 className="text-2xl font-semibold mb-3">
          Finalizing your account
        </h1>

        <p className="text-sm text-neutral-400">
          Please wait while we complete your sign-up.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
        </div>
      </div>
    </main>
  );
}
