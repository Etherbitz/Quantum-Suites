/**
 * Displays scan results.
 */
export function ScanResults({ result }: { result: any }) {
  return (
    <div className="mt-12 rounded-2xl border bg-white p-6 text-left shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Scan Results
      </h2>

      <p className="mt-2 text-gray-700">
        Risk Level:{" "}
        <span className="font-semibold text-amber-600">
          {result.riskLevel}
        </span>
      </p>

      <p className="mt-1 text-gray-600">
        Compliance Score: {result.score}/100
      </p>

      <ul className="mt-4 space-y-2 text-gray-700">
        {result.issues.map((issue: string) => (
          <li key={issue}>• {issue}</li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-500">
        Scanned at {new Date(result.scannedAt).toLocaleString()}
      </p>
    </div>
  );
}
