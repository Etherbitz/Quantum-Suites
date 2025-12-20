import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 90;
const SPINNER_DELAY_MS = 300;

export function useScanJobPolling(scanJobId: string | null) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "queued" | "running" | "completed" | "failed"
  >("queued");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const attemptsRef = useRef(0);
  const spinnerTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scanJobId) return;

    spinnerTimeoutRef.current = window.setTimeout(
      () => setLoading(true),
      SPINNER_DELAY_MS
    );

    return () => {
      if (spinnerTimeoutRef.current)
        window.clearTimeout(spinnerTimeoutRef.current);
    };
  }, [scanJobId]);

  useEffect(() => {
    if (!scanJobId) return;

    let active = true;

    intervalRef.current = window.setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_ATTEMPTS) {
        window.clearInterval(intervalRef.current!);
        if (active) {
          setStatus("failed");
          setError("Scan timed out. Please try again.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `/api/scan/status?jobId=${scanJobId}`
        );
        if (!res.ok) throw new Error();

        const data = await res.json();
        setStatus(data.status);

        if (data.status === "completed") {
          window.clearInterval(intervalRef.current!);
          setLoading(false);
          if (active && data.scanId) {
            router.push(`/scan/results?scanId=${data.scanId}`);
          }
        }

        if (data.status === "failed") {
          window.clearInterval(intervalRef.current!);
          setError("Scan failed. Please try again.");
          setLoading(false);
        }
      } catch {
        window.clearInterval(intervalRef.current!);
        if (active) {
          setError("Could not check scan status.");
          setLoading(false);
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      if (intervalRef.current)
        window.clearInterval(intervalRef.current);
    };
  }, [scanJobId, router]);

  const retry = () => {
    attemptsRef.current = 0;
    setError(null);
    setStatus("queued");
    setLoading(false);
  };

  return { status, loading, error, retry };
}
