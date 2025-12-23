import dns from "dns/promises";

type PartialScanResult = {
  mode: "partial";
  reason: string;
  checks: Array<{
    id: string;
    status: "pass" | "fail" | "warn" | "info";
    title: string;
    detail?: string;
    fix?: string;
  }>;
};

export async function runPartialScan(url: string): Promise<PartialScanResult> {
  const checks: PartialScanResult["checks"] = [];

  const u = new URL(url);

  // 1) HTTPS enforced
  checks.push({
    id: "https",
    status: u.protocol === "https:" ? "pass" : "fail",
    title: "HTTPS enforced",
    fix:
      u.protocol === "https:" ? undefined : "Redirect all traffic to HTTPS",
  });

  // 2) DNS resolution
  try {
    await dns.lookup(u.hostname);
    checks.push({
      id: "dns",
      status: "pass",
      title: "DNS resolves",
    });
  } catch {
    checks.push({
      id: "dns",
      status: "fail",
      title: "DNS resolution failed",
      fix: "Ensure DNS records are correctly configured",
    });
  }

  // 3) robots.txt presence
  try {
    const res = await fetch(`${u.origin}/robots.txt`, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    checks.push({
      id: "robots",
      status: res.ok ? "info" : "warn",
      title: "robots.txt accessible",
      detail: res.ok ? "robots.txt found" : "robots.txt not found",
    });
  } catch {
    checks.push({
      id: "robots",
      status: "warn",
      title: "robots.txt unreachable",
    });
  }

  return {
    mode: "partial",
    reason: "SITE_BLOCKED_AUTOMATED_SCANS",
    checks,
  };
}
