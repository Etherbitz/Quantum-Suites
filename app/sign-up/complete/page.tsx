"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Post-signup completion page.
 * Attaches an anonymous scan to the authenticated user.
 */
export default function SignupCompletePage() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get("scanId");

  useEffect(() => {
    async function finalize() {
      if (scanId) {
        await fetch("/api/scan/attach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scanId }),
        });

        router.replace(`/scan/results?scanId=${scanId}`);
      } else {
        router.replace("/dashboard");
      }
    }

    finalize();
  }, [scanId, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Finalizing your account…</p>
    </main>
  );
}
