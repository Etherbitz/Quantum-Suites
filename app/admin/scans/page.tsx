import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { ClientDateTime } from "@/components/common/ClientDateTime";

export default async function AdminScansPage() {
  await requireAdmin();

  const scans = await prisma.scanJob.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      score: true,
      createdAt: true,
      user: {
        select: { email: true },
      },
      website: {
        select: { url: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Scans</h1>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left">Website</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="border-t border-neutral-800 hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/scans/${scan.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    {scan.website?.url ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {scan.user?.email ?? "anonymous"}
                </td>
                <td className="px-4 py-3 uppercase">
                  {scan.status}
                </td>
                <td className="px-4 py-3">
                  {scan.score ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  <ClientDateTime value={scan.createdAt.toISOString()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
