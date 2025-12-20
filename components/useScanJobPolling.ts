"use client";

import { useEffect, useRef, useState } from "react";

type JobStatus = "idle" | "queued" | "running" | "completed" | "failed";

interface Options {
  scanJobId: string | null;
  onCompleted?: (scanId: string) => void;
  onFailed?: (message: string) => void;
  pollIntervalMs?: number;
  maxAttempts?: number;
  spinnerDelayMs?: number;
}

const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_MAX_ATTEMPTS = 90; // ~3 minutes
const DEFAULT_SPINNER_DELAY_MS = 300;

/**
 * Polls the scan status endpoint until completion/failure.
 */
export function useScanJobPolling({
  scanJobId,
  onCompleted,
  onFailed,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  spinnerDelayMs = DEFAULT_SPINNER_DELAY_MS,
}: Options) {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const attemptsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinnerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!scanJobId) {
      setStatus("idle");
      setError(null);
      setLoading(false);
      attemptsRef.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
      return;
    }

    let active = true;
    attemptsRef.current = 0;
    setStatus("queued");

    spinnerTimeoutRef.current = setTimeout(
      () => setLoading(true),
      spinnerDelayMs
    );

    intervalRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > maxAttempts) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (active) {
          setStatus("failed");
          setError("Scan timed out. Please try again.");
          setLoading(false);
          onFailed?.("Scan timed out. Please try again.");
        }
        return;
      }

      try {
        const res = await fetch(`/api/scan/create/status?jobId=${scanJobId}`);
        if (!res.ok) throw new Error("Status check failed");
        const data = await res.json();

        setStatus(data.status);

        if (data.status === "completed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setLoading(false);
          setError(null);
          if (active && data.scanId) onCompleted?.(data.scanId);
        }

        if (data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setLoading(false);
          const message = "Scan failed. Please try again.";
          setError(message);
          if (active) onFailed?.(message);
        }
      } catch (err) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLoading(false);
        const message =
          err instanceof Error
            ? err.message
            : "Could not check status. Please retry.";
        setError(message);
        if (active) onFailed?.(message);
      }
    }, pollIntervalMs);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
    };
  }, [
    maxAttempts,
    onCompleted,
    onFailed,
    pollIntervalMs,
    scanJobId,
    spinnerDelayMs,
  ]);

  const reset = () => {
    setStatus("idle");
    setError(null);
    setLoading(false);
    attemptsRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
  };

  return { status, error, loading, reset };
}
