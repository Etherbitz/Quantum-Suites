"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UsageMeter } from "@/components/common/UsageMeter";
import { useScanJobPolling } from "@/components/scan/useScanJobPolling";

type ScanCreateResponse = {
  scanJobId?: string;
  scanId?: string;
  error?: string;
  reason?: string;
};

type ScanError = {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const isDev = process.env.NODE_ENV === "development";

function mapScanError(error?: string | null, reason?: string | null): ScanError {
  const combined = `${error ?? ""} ${reason ?? ""}`.toUpperCase();

  switch (error) {
    case "WEBSITE_LIMIT_REACHED":
      return {
        title: "Website limit reached",
        message:
          "Your free plan includes 1 website. Upgrade to scan multiple sites, schedule scans, and receive alerts.",
        ctaLabel: "Upgrade Plan",
        ctaHref: "/billing",
      };

    case "LOCALHOST_NOT_SUPPORTED":
      return {
        title: "Localhost scans are not supported",
        message:
          "Please enter a publicly accessible website URL. Localhost URLs cannot be scanned.",
      };

    case "SCAN_FREQUENCY_LIMIT":
      return {
        title: "Scan frequency limit reached",
        message:
          "You recently scanned this site. Please wait before running another scan on this plan, or upgrade for more frequent checks.",
        ctaLabel: "View Plans",
        ctaHref: "/pricing",
      };

    case "EXECUTION_RATE_LIMIT":
      return {
        title: "Too many scans this hour",
        message:
          "You have reached the hourly scan limit for your current plan. Try again in a bit or upgrade for higher throughput.",
        ctaLabel: "Upgrade Plan",
        ctaHref: "/billing",
      };

    case "CONCURRENCY_LIMIT":
      return {
        title: "Too many scans running",
        message:
          "You already have the maximum number of scans running in parallel. Wait for one to finish, then try again.",
      };

    default:
      if (combined.includes("FETCH_FAILED")) {
        return {
          title: "Site blocked automated scans",
          message:
            "This website may be blocking automated scans. Results may be limited or unavailable.",
        };
      }

      return {
        title: "Scan failed",
        message:
          isDev && reason
            ? reason
            : "Something went wrong. Please try again.",
      };
  }
}

export default function ScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ScanError | null>(null);
  const [scanJobId, setScanJobId] = useState<string | null>(null);

  const {
    status: jobStatus,
    loading: polling,
    reset: resetPolling,
  } = useScanJobPolling({
    scanJobId,
    onCompleted: (scanId) => router.push(`/scan/results?scanId=${scanId}`),
    onFailed: (message) => setError(mapScanError(message)),
  });

  const isBusy = loading || polling || Boolean(scanJobId);

  function normalizeUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    resetPolling();
    setScanJobId(null);
    setLoading(true);

    const normalizedUrl = normalizeUrl(url);
    setUrl(normalizedUrl);

    try {
      const res = await fetch("/api/scan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      let payload: ScanCreateResponse | null = null;
      try {
        payload = (await res.json()) as ScanCreateResponse;
      } catch {
        payload = null;
      }

      const payloadScanId = payload?.scanJobId ?? payload?.scanId;

      if (res.ok && payloadScanId) {
        setScanJobId(payloadScanId);
        return;
      }

      if (res.status === 401) {
        const fallback = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        if (!fallback.ok) {
          throw new Error("Scan failed. Please try again.");
        }

        const { scanId } = await fallback.json();
        router.push(`/scan/results?scanId=${scanId}`);
        return;
      }

      setError(mapScanError(payload?.error, payload?.reason));
    } catch (err) {
      setError(
        mapScanError(
          err instanceof Error ? err.message : null,
          err instanceof Error ? err.message : null
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quantum Suites AI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <SignedOut>
              <Link
                href="/sign-up"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Compact Hero + Form Section */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live compliance check — no code, no setup
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Scan Your Website
              </span>
            </h1>

            <p className="mt-3 text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
              Get a compliance risk score, top issues, and a shareable report in under a minute.
            </p>
          </div>

          {/* Usage Meter */}
          <div className="mb-8">
            <UsageMeter />
          </div>

          {/* Scan Form */}
          <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-10">
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
                disabled={isBusy}
                className="w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isBusy ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {scanJobId
                      ? jobStatus === "running"
                        ? "Scanning your site…"
                        : jobStatus === "queued"
                          ? "Queued…"
                          : jobStatus === "completed"
                            ? "Redirecting to results…"
                            : "Checking status…"
                      : "Starting your scan…"}
                  </span>
                ) : (
                  "🚀 Start Free Scan"
                )}
              </button>

              {scanJobId && (
                <p className="text-center text-sm text-blue-700">
                  Status: {jobStatus === "queued" ? "Queued (polling every 2s)…" : jobStatus === "running" ? "Scanning in progress…" : jobStatus === "failed" ? "Failed — please retry." : jobStatus}
                </p>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h4 className="font-semibold text-red-700">
                    {error.title}
                  </h4>
                  <p className="text-sm text-red-600 mt-1">
                    {error.message}
                  </p>

                  {error.ctaHref && (
                    <Link
                      href={error.ctaHref}
                      className="mt-3 inline-block rounded-md bg-black px-4 py-2 text-sm text-white"
                    >
                      {error.ctaLabel}
                    </Link>
                  )}
                </div>
              )}

              <p className="text-center text-sm text-gray-500">
                Takes less than 60 seconds • No signup required
              </p>
            </form>
            </div>

            <div className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 md:p-7 text-left text-sm text-blue-900">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                What you&apos;ll see
              </h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-semibold">Compliance risk score</span> — a single number out of 100 to track over time.
                </li>
                <li>
                  <span className="font-semibold">Top accessibility, privacy, and security issues</span> in plain language.
                </li>
                <li>
                  <span className="font-semibold">Downloadable CSV + HTML/PDF report</span> you can forward to stakeholders or save for audit.
                </li>
                <li>
                  <span className="font-semibold">No changes to your site</span> — we only analyze the public pages you point us at.
                </li>
              </ul>

              <p className="pt-2 text-xs text-blue-800/80">
                Tip: After your scan completes, use the HTML report&apos;s Print menu to save a polished PDF for your records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What You&apos;ll Get From Your Free Scan
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
            <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <span>Unlock Full Reports</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

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
          <Link href="/pricing" className="text-purple-600 font-semibold text-sm hover:text-purple-700">
            View Plans →
          </Link>
        </div>
      )}
    </div>
  );
}