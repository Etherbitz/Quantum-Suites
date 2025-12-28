"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SignupTracker() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Prevent duplicate firing
    const hasTracked =
      typeof window !== "undefined"
        ? window.localStorage.getItem("qs_signup_tracked")
        : null;
    if (hasTracked) return;

    if (typeof window !== "undefined") {
      const w = window as any;
      if (typeof w.gtag === "function") {
        w.gtag("event", "sign_up", {
          method: "clerk",
        });
      }
      window.localStorage.setItem("qs_signup_tracked", "true");
    }
  }, [isLoaded, user]);

  return null;
}
