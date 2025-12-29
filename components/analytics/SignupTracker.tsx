"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function SignupTracker() {
  const { user, isLoaded } = useUser();
  const fired = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || fired.current) return;

    fired.current = true;

    if (typeof window !== "undefined") {
      const w = window as any;
      if (typeof w.gtag === "function") {
        // Track a login event for analytics only.
        // True sign-ups fire "sign_up" from the onboarding
        // completion page so Google Ads conversions stay clean.
        w.gtag("event", "login", {
          method: "clerk",
        });
      }
    }
  }, [isLoaded, user]);

  return null;
}
