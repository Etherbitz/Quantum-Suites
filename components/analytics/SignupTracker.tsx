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
        w.gtag("event", "sign_up", {
          method: "clerk",
        });
      }
    }
  }, [isLoaded, user]);

  return null;
}
