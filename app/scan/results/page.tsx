export const dynamic = "force-dynamic";

import ResultsShell from "./ResultsServer";

export default function ScanResultsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ResultsShell searchParams={searchParams} />;
}
