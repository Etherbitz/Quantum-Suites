import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RerunScanButton } from "@/components/admin";

export default async function AdminScanInspector({
  params,
}: {
  params: { scanId: string };
}) {
  await requireAdmin();

  const scan = await prisma.scanJob.findUnique({
    where: { id: params.scanId },
    include: {
      user: { select: { email: true } },
      website: { select: { url: true } },
    },
  });

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
          value={scan.createdAt.toLocaleString()}
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
