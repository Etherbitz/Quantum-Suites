"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { UsageMeter } from "@/components/common/UsageMeter";
import { ResultsSummary } from "@/components/features/scan/ResultsSummary";
import { ResultsGrid } from "@/components/features/scan/ResultsGrid";
import { LockedSection } from "@/components/LockedSection";
import { ResultsSuggestions } from "@/components/results/ResultsSuggestions";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";
import { hasFeature } from "@/lib/featureAccess";
import { AiAssistant } from "@/components/results/AiAssistant";
import { TopIssuesPreview } from "@/components/results/TopIssuesPreview";
import { trackEvent } from "@/lib/analytics/gtag";
import type { Plan } from "@/lib/plans";

export default function ResultsClient({
  scan,
  plan,
  isAuthenticated,
}: {
  scan: any;
  plan: Plan;
  isAuthenticated: boolean;
  isAnonView?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(
    String(scan.status).toUpperCase()
  );
  const [isRerunning, setIsRerunning] = useState(false);

  const scanCompleted = status === "COMPLETED";
  const scanFailed = status === "FAILED";

  const results = scan.results ?? null;
  const websiteUrl: string | undefined =
    (scan?.website?.url as string | undefined) ?? undefined;

  async function handleRerun() {
    if (!websiteUrl || isRerunning) return;

    try {
      setIsRerunning(true);

      const endpoint = isAuthenticated ? "/api/scan/create" : "/api/scan";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!res.ok) {
        let message = "Unable to start a new scan.";
        try {
          const data = await res.json();
          if (data?.error) {
            message = String(data.error);
          }
        } catch {
          // ignore JSON parse errors
        }
        alert(message);
        return;
      }

      const data = await res.json();
      const nextScanId = data?.scanId;

      if (nextScanId) {
        router.push(`/scan/results?scanId=${nextScanId}`);
      }
    } catch (err) {
      console.error("RERUN_SCAN_FAILED", err);
      alert("Something went wrong starting a new scan. Please try again.");
    } finally {
      setIsRerunning(false);
    }
  }

  // When users land on this page directly after signing in, the
  // scan may still be running. Poll the lightweight status endpoint
  // and once it completes, optionally move them into the dashboard.
  useEffect(() => {
    if (!scan.id) return;
    if (scanCompleted || scanFailed) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan?scanId=${scan.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        const nextStatus = String(data.status).toUpperCase();

        setStatus(nextStatus);

        if (nextStatus === "COMPLETED") {
          clearInterval(interval);
          // If they are signed in, you could route them to the dashboard.
          if (isAuthenticated) {
            router.push("/dashboard");
          }
        }

        if (nextStatus === "FAILED") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("SCAN_STATUS_POLL_FAILED", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scan.id, scanCompleted, scanFailed, isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-950 to-black px-4 py-8 text-neutral-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-neutral-800 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Quantum Suites AI
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">
              Compliance scan results
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Live snapshot of your accessibility, privacy, and security posture.
            </p>

            {websiteUrl && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-[11px] text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="uppercase tracking-[0.18em] text-neutral-500">
                  Scanned URL
                </span>
                <span className="max-w-56 truncate font-mono text-[11px] text-neutral-100">
                  {websiteUrl}
                </span>
              </p>
            )}
          </div>

          <div className="w-full max-w-xs rounded-xl border border-neutral-800 bg-neutral-950/80 p-3">
            <UsageMeter />
          </div>
        </header>

        {!scanCompleted && !scanFailed && (
          <section className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Scan in progress</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  We&apos;re analyzing your pages and security headers in real time.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>Running checks · live</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-400">
              This page will update automatically when your scan finishes.
            </p>
          </section>
        )}

        {scanFailed && (
          <section className="mt-4 rounded-xl border border-red-800/60 bg-red-950/40 p-6">
            <h2 className="text-lg font-semibold text-red-200">
              Scan could not complete
            </h2>
            <p className="mt-1 text-xs text-red-200/80">
              Something interrupted this scan after you signed in. Try
              running it again from the scan page.
            </p>
          </section>
        )}

        {scanCompleted && (
          <section className="mt-4">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
              <div className="space-y-6">
                <ResultsSummary
                  scan={scan}
                  isPartial={false}
                  plan={plan}
                  results={results}
                  isAuthenticated={isAuthenticated}
                />

                {typeof results !== "undefined" && results !== null && (
                  <TopIssuesPreview
                    results={results}
                    mode={!isAuthenticated ? "anon" : plan === "free" ? "free" : "paid"}
                  />
                )}

                {isAuthenticated && hasFeature(plan, "aiAssistant") && (
                  <AiAssistant scanId={scan.id} />
                )}

                {hasFeature(plan, "detailedReports") ? (
                  <ResultsGrid results={results} plan={plan} />
                ) : (
                  <LockedSection
                    scanId={scan.id}
                    isAuthenticated={isAuthenticated}
                    plan={plan}
                  />
                )}

                {isAuthenticated && hasFeature(plan, "suggestions") && (
                  <ResultsSuggestions results={results} />
                )}

                {isAuthenticated && !hasFeature(plan, "suggestions") && (
                  <UpgradeCTA reason="AI suggestions are available on Business plans." />
                )}
              </div>

              <aside className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-neutral-50">
                  Next best actions
                </h3>
                <p className="text-xs text-neutral-400">
                  Turn this scan into progress. Share, schedule, and keep an eye
                  on changes over time.
                </p>

                {websiteUrl && (
                  <button
                    type="button"
                    onClick={handleRerun}
                    disabled={isRerunning}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRerunning ? "Re-running scan..." : "Re-run this scan for this URL"}
                  </button>
                )}

                <ul className="space-y-3 text-xs text-neutral-200">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <div>
                      <p className="font-medium">Share results with your team</p>
                      <p className="text-neutral-400">
                        Share a link to your dashboard or export a report for
                        stakeholders.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <div>
                      <p className="font-medium">Schedule recurring scans</p>
                      <p className="text-neutral-400">
                        Use your dashboard to keep this site on a weekly or
                        continuous monitor.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <div>
                      <p className="font-medium">Create a lightweight audit trail</p>
                      <p className="text-neutral-400">
                        Capture scores over time so you can show regulators and
                        clients that you&apos;re watching risk.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-2 flex flex-col gap-2 text-xs">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
                  >
                    Open compliance dashboard
                  </Link>
                  <Link
                    href="/dashboard/reports"
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-3 py-2 font-medium text-neutral-100 hover:border-neutral-500"
                  >
                    View reports & exports
                  </Link>
                  {!hasFeature(plan, "detailedReports") && (
                    <p className="mt-1 text-[11px] text-neutral-500">
                      On the free plan you&apos;ll see high-level issues. Upgrade to
                      unlock full historical views and CSV/PDF exports.
                    </p>
                  )}

                  {!isAuthenticated && (
                    <Link
                      href={`/sign-up?scanId=${scan.id}`}
                      onClick={() =>
                        trackEvent("signup_cta_click", {
                          location: "results_save_scan",
                          scanId: scan.id,
                        })
                      }
                      className="mt-2 inline-flex items-center justify-center rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/20"
                    >
                      Save this scan & create free account
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
