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
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block mb-6">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ⚡ Free Compliance Check
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Scan Your Website
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Get instant insights into your website's compliance risks. 
            <span className="font-semibold text-gray-900"> Takes less than 60 seconds.</span>
          </p>

          {/* Usage Meter */}
          <div className="mt-8 max-w-xl mx-auto">
            <UsageMeter />
          </div>
        </div>
      </section>

      {/* Scan Form Section */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter Your Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <input
                    id="url"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border-2 border-gray-300 pl-12 pr-4 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Your Website…
                  </span>
                ) : (
                  "🚀 Start Free Scan"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                No credit card required • Results in seconds • 100% free
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You'll Get From Your Free Scan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Compliance Score"
              description="Get a clear risk rating: Low, Medium, or High based on industry standards"
            />
            <FeatureCard
              icon="🔍"
              title="Detailed Analysis"
              description="See exactly what issues were found and why they matter for your business"
            />
            <FeatureCard
              icon="📋"
              title="Action Plan"
              description="Receive prioritized recommendations to improve your compliance"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Feature card component
 */
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}