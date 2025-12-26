"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/features/onboarding/OnboardFlow";
import { trackEvent } from "@/lib/analytics/track";

export default function SignUpCompletePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeUser() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.replace("/sign-in");
        return;
      }

      try {
        // Call API to initialize user in database
        const response = await fetch("/api/auth/init", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to initialize user");
        }

        const data = await response.json();

        // Track page view
        await trackEvent("onboarding_viewed", {
          userId: data.user.id,
          email: data.user.email,
          plan: data.user.plan,
        });

        setIsInitializing(false);
        setShowOnboarding(true);
      } catch (err) {
        console.error("Error initializing user:", err);
        setError("Something went wrong. Redirecting to dashboard...");
        
        // Still redirect to dashboard even if initialization fails
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2000);
      }
    }

    initializeUser();
  }, [isLoaded, isSignedIn, router]);

  const handleOnboardingComplete = async () => {
    // Track onboarding completion
    if (user) {
      await trackEvent("onboarding_completed", {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      });
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-800 bg-neutral-950 p-8 shadow-xl text-center">
          <h1 className="text-2xl font-semibold mb-3 text-red-400">
            Oops!
          </h1>
          <p className="text-sm text-neutral-400">{error}</p>
        </div>
      </main>
    );
  }

  if (isInitializing) {
    return (
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
    );
  }

  if (showOnboarding) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-6">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  return null;
}
