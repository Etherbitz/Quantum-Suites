import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RerunScanButton } from "@/components/admin";
import { ClientDateTime } from "@/components/common/ClientDateTime";

export default async function AdminScanInspector({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const resolvedParams = await params;
  await requireAdmin();

  const [scan, executionLogs] = await Promise.all([
    prisma.scanJob.findUnique({
      where: { id: resolvedParams.scanId },
      include: {
        user: { select: { email: true } },
        website: { select: { url: true } },
      },
    }),
    // Use a loose cast so this compiles before Prisma client is regenerated
    (prisma as any).scanExecutionLog
      ?.findMany?.({
        where: { scanJobId: resolvedParams.scanId },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      .catch?.(() => []) ?? [],
  ]);

  if (!scan) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Scan Inspector</h1>
          <p className="text-sm text-neutral-400">
            {scan.website?.url ?? "—"}
          </p>
        </div>

        <RerunScanButton scanId={scan.id} />
      </div>

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Status" value={scan.status} />
        <Info label="Score" value={scan.score ?? "—"} />
        <Info label="User" value={scan.user?.email ?? "anonymous"} />
        <Info
          label="Created"
          value={<ClientDateTime value={scan.createdAt.toISOString()} />}
        />
      </div>

      {/* Summary */}
      <Section title="Summary">
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(scan.summary, null, 2)}
        </pre>
      </Section>

      {/* Raw Results */}
      <Section title="Raw Results">
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(scan.results, null, 2)}
        </pre>
      </Section>

      {/* Errors */}
      {scan.error && (
        <Section title="Error">
          <pre className="text-xs text-red-400">
            {scan.error}
          </pre>
        </Section>
      )}

      {/* Execution logs */}
      {Array.isArray(executionLogs) && executionLogs.length > 0 && (
        <Section title="Execution logs">
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full text-left">
              <thead className="border-b border-neutral-800 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-2 py-1">Time</th>
                  <th className="px-2 py-1">Phase</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Duration (ms)</th>
                  <th className="px-2 py-1">Error code</th>
                </tr>
              </thead>
              <tbody>
                {executionLogs.map((log: any) => (
                  <tr
                    key={log.id}
                    className="border-b border-neutral-900/60 last:border-0"
                  >
                    <td className="px-2 py-1 text-[11px] text-neutral-400">
                      <ClientDateTime
                        value={
                          typeof log.createdAt === "string"
                            ? log.createdAt
                            : new Date(log.createdAt).toISOString()
                        }
                      />
                    </td>
                    <td className="px-2 py-1 text-[11px] text-neutral-100">
                      {log.phase}
                    </td>
                    <td className="px-2 py-1 text-[11px] text-neutral-100">
                      {log.status}
                    </td>
                    <td className="px-2 py-1 text-[11px] text-neutral-100">
                      {log.durationMs}
                    </td>
                    <td className="px-2 py-1 text-[11px] text-red-300">
                      {log.errorCode ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="text-xs uppercase text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <h2 className="mb-3 text-lg font-medium">{title}</h2>
      {children}
    </div>
  );
}
