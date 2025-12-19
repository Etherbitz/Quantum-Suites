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
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quantum Suites AI
          </a>
          <div className="flex gap-4">
            <a href="/" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="/sign-up" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Compact Hero + Form Section */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                ⚡ Free Compliance Check
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Scan Your Website
              </span>
            </h1>
            
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Get your compliance risk score in seconds — 100% free, no credit card required
            </p>
          </div>

          {/* Usage Meter */}
          <div className="mb-8">
            <UsageMeter />
          </div>

          {/* Scan Form */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 md:p-10">
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
                Takes less than 60 seconds • No signup required
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What You'll Get From Your Free Scan
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Instantly see your compliance risk score. Upgrade for detailed analysis and action plans.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Compliance Risk Score"
              badge="FREE"
              description="Get a clear risk rating: Low, Medium, or High based on industry standards"
              isFree={true}
            />
            <FeatureCard
              icon="🔍"
              title="Detailed Analysis"
              badge="PAID"
              description="See exactly what issues were found and why they matter for your business"
              isFree={false}
            />
            <FeatureCard
              icon="📋"
              title="Priority Action Plan"
              badge="PAID"
              description="Receive step-by-step recommendations to fix compliance issues"
              isFree={false}
            />
          </div>

          <div className="mt-12 text-center">
            <a href="/pricing" className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <span>Unlock Full Reports</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Feature card component
 */
function FeatureCard({ icon, title, badge, description, isFree }: { icon: string; title: string; badge: string; description: string; isFree: boolean }) {
  return (
    <div className={`relative text-center p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
      isFree 
        ? 'bg-linear-to-br from-green-50 to-blue-50 border-green-200 hover:border-green-400' 
        : 'bg-linear-to-br from-gray-50 to-purple-50 border-purple-200 hover:border-purple-400'
    }`}>
      <div className="absolute -top-3 right-4">
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
          isFree 
            ? 'bg-green-500 text-white' 
            : 'bg-purple-500 text-white'
        }`}>
          {badge}
        </span>
      </div>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      {!isFree && (
        <div className="mt-4">
          <a href="/pricing" className="text-purple-600 font-semibold text-sm hover:text-purple-700">
            View Plans →
          </a>
        </div>
      )}
    </div>
  );
}