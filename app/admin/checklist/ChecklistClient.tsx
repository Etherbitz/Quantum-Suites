"use client";

import { useMemo, useState } from "react";

type CheckState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "pass"; detail?: string }
  | { status: "fail"; detail: string };

function getDetail(state: CheckState): string {
  if (state.status === "pass") return state.detail ?? "";
  if (state.status === "fail") return state.detail;
  return "";
}

function Badge({ state }: { state: CheckState }) {
  const cls =
    state.status === "pass"
      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
      : state.status === "fail"
      ? "border-red-500/50 bg-red-500/10 text-red-200"
      : state.status === "running"
      ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
      : "border-neutral-700 bg-neutral-900 text-neutral-300";

  const label =
    state.status === "pass"
      ? "PASS"
      : state.status === "fail"
      ? "FAIL"
      : state.status === "running"
      ? "RUNNING"
      : "IDLE";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function ChecklistClient() {
  const [authCheck, setAuthCheck] = useState<CheckState>({ status: "idle" });
  const [anonScanCheck, setAnonScanCheck] = useState<CheckState>({ status: "idle" });
  const [attachCheck, setAttachCheck] = useState<CheckState>({ status: "idle" });

  const [scanId, setScanId] = useState<string>("");
  const [scanUrl, setScanUrl] = useState<string>("https://example.com/");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const recommendedCanonical = "https://www.quantumsuites-ai.com";

  const signupUrl = useMemo(() => {
    if (!scanId) return "";
    const resultsUrl = `/scan/results?scanId=${encodeURIComponent(scanId)}`;
    return `/sign-up?scanId=${encodeURIComponent(scanId)}&redirect_url=${encodeURIComponent(resultsUrl)}`;
  }, [scanId]);

  async function runAuthCheck() {
    setAuthCheck({ status: "running" });

    try {
      const res = await fetch("/api/auth/init", { method: "POST" });
      const data = await safeJson(res);

      if (!res.ok) {
        setAuthCheck({
          status: "fail",
          detail:
            (data && (data.error || data.message))
              ? String(data.error || data.message)
              : `HTTP ${res.status}`,
        });
        return;
      }

      const email = data?.user?.email ? String(data.user.email) : "";
      setAuthCheck({
        status: "pass",
        detail: email ? `DB user ok: ${email}` : "Authenticated + DB init ok",
      });
    } catch (err) {
      setAuthCheck({
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function runAnonymousScan() {
    setAnonScanCheck({ status: "running" });
    setAttachCheck({ status: "idle" });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setAnonScanCheck({
          status: "fail",
          detail:
            (data && (data.error || data.reason))
              ? `${data.error}${data.reason ? `: ${data.reason}` : ""}`
              : `HTTP ${res.status}`,
        });
        return;
      }

      const id = data?.scanId ? String(data.scanId) : "";
      if (!id) {
        setAnonScanCheck({ status: "fail", detail: "Missing scanId in response" });
        return;
      }

      setScanId(id);
      setAnonScanCheck({ status: "pass", detail: `scanId=${id}` });
    } catch (err) {
      setAnonScanCheck({
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function runAttachCheck() {
    if (!scanId) {
      setAttachCheck({ status: "fail", detail: "Run an anonymous scan first." });
      return;
    }

    setAttachCheck({ status: "running" });

    try {
      const res = await fetch("/api/scan/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setAttachCheck({
          status: "fail",
          detail:
            (data && data.error) ? String(data.error) : `HTTP ${res.status}`,
        });
        return;
      }

      // Optional: verify server-side ownership via admin-only endpoint.
      const verifyRes = await fetch(
        `/api/admin/diagnostics/scan-job?scanId=${encodeURIComponent(scanId)}`,
        { cache: "no-store" }
      );
      const verify = await safeJson(verifyRes);

      if (!verifyRes.ok) {
        setAttachCheck({
          status: "pass",
          detail: "Attach succeeded (verification endpoint unavailable)",
        });
        return;
      }

      const ownerEmail = verify?.scanJob?.user?.email ? String(verify.scanJob.user.email) : "";
      const isOwned = Boolean(verify?.scanJob?.userId);

      setAttachCheck({
        status: isOwned ? "pass" : "fail",
        detail: isOwned
          ? `Attached. Owner: ${ownerEmail || verify.scanJob.userId}`
          : "Attach call returned ok, but scanJob.userId is still empty",
      });
    } catch (err) {
      setAttachCheck({
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-xs text-neutral-300">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Domain sanity
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Current origin</div>
            <div className="mt-1 font-mono text-[11px] text-neutral-100 break-all">{origin || "—"}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">NEXT_PUBLIC_APP_URL</div>
            <div className="mt-1 font-mono text-[11px] text-neutral-100 break-all">{appUrl || "(not set)"}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Recommended</div>
            <div className="mt-1 font-mono text-[11px] text-neutral-100 break-all">{recommendedCanonical}</div>
          </div>
        </div>
        {origin && appUrl && origin !== appUrl && (
          <p className="mt-2 text-[11px] text-amber-300">
            Warning: origin ≠ NEXT_PUBLIC_APP_URL. This often breaks Clerk/Stripe redirects.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Step 1
            </p>
            <h2 className="mt-1 text-sm font-semibold text-neutral-50">Clerk auth + DB user</h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              Calls <span className="font-mono">POST /api/auth/init</span> (must be signed in).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge state={authCheck} />
            <button
              onClick={runAuthCheck}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Run
            </button>
          </div>
        </div>
        {authCheck.status !== "idle" && getDetail(authCheck) && (
          <p className="mt-2 text-[11px] text-neutral-400">{getDetail(authCheck)}</p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Step 2
            </p>
            <h2 className="mt-1 text-sm font-semibold text-neutral-50">Anonymous scan works</h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              Calls <span className="font-mono">POST /api/scan</span> and records the returned scan ID.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge state={anonScanCheck} />
            <button
              onClick={runAnonymousScan}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Run
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px]">
          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Test URL
            </label>
            <input
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              scanId
            </label>
            <input
              value={scanId}
              onChange={(e) => setScanId(e.target.value)}
              placeholder="(generated)"
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {anonScanCheck.status !== "idle" && getDetail(anonScanCheck) && (
          <p className="mt-2 text-[11px] text-neutral-400">{getDetail(anonScanCheck)}</p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Step 3
            </p>
            <h2 className="mt-1 text-sm font-semibold text-neutral-50">Signup attach works</h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              Simulates the post-signup attach step by calling <span className="font-mono">POST /api/scan/attach</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge state={attachCheck} />
            <button
              onClick={runAttachCheck}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Run
            </button>
          </div>
        </div>

        {attachCheck.status !== "idle" && getDetail(attachCheck) && (
          <p className="mt-2 text-[11px] text-neutral-400">{getDetail(attachCheck)}</p>
        )}

        <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-[11px] text-neutral-300">
          <p className="font-semibold text-neutral-100">Manual end-to-end signup test</p>
          <p className="mt-1 text-neutral-400">
            Open this link in an incognito window, complete signup, and you should land back on the scan results with the scan saved.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-[10px] text-neutral-200">
              {signupUrl || "(run Step 2 to generate a signup link)"}
            </code>
            {signupUrl && (
              <a
                href={signupUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[11px] font-semibold text-neutral-200 hover:border-neutral-500"
              >
                Open
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
