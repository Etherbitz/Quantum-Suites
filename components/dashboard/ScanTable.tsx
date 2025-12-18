import Link from "next/link";

/**
 * Recent scan table.
 */
export function ScanTable() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Recent Scans
      </h2>

      <table className="mt-4 w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th>Website</th>
            <th>Date</th>
            <th>Risk</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          <tr>
            <td>example.com</td>
            <td>Today</td>
            <td className="text-amber-600 font-medium">Medium</td>
          </tr>
        </tbody>
      </table>

      <Link
        href="/dashboard/reports"
        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
      >
        View all reports →
      </Link>
    </div>
  );
}
