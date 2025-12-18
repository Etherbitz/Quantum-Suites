"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UsageMeter } from "@/components/UsageMeter";

export default function ScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const { scanId } = await res.json();
    router.push(`/scan/results?scanId=${scanId}`);
  }

  return (
    <main className="px-6 py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-semibold">Scan Your Website</h1>

        <div className="mt-6">
          <UsageMeter />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold"
          >
            {loading ? "Scanning…" : "Start Free Scan"}
          </button>
        </form>
      </div>
    </main>
  );
}