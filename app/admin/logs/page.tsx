import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";
import { ActivityLogBulkActions } from "@/components/admin/ActivityLogBulkActions";
import { ActivityLogRowActions } from "@/components/admin/ActivityLogRowActions";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();

  const qRaw = searchParams?.q;
  const statusRaw = searchParams?.status;

  const q = typeof qRaw === "string" ? qRaw.trim() : "";
  const statusFilter =
    typeof statusRaw === "string" && statusRaw !== "all"
      ? statusRaw
      : "";

  const where: any = {};

  if (q) {
    where.OR = [
      {
        id: { contains: q },
      },
      {
        type: { contains: q, mode: "insensitive" },
      },
      {
        user: {
          email: { contains: q, mode: "insensitive" },
        },
      },
      {
        website: {
          url: { contains: q, mode: "insensitive" },
        },
      },
    ];
  }

  if (statusFilter) {
    where.status = statusFilter.toUpperCase();
  }

  const jobs = await prisma.scanJob.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      status: true,
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
    <main className="mx-auto max-w-7xl px-6 py-10 text-neutral-50">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Admin · Activity
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Recent activity log
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Latest scan jobs across the system for quick debugging.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <form
          className="mb-3 flex flex-col gap-3 text-xs text-neutral-400 md:flex-row md:items-center md:justify-between"
          method="GET"
        >
          <div className="flex items-center gap-3">
            <span>
              Showing last {jobs.length} scan jobs.
            </span>
            <ActivityLogBulkActions hasJobs={jobs.length > 0} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search email, URL, type, ID"
              className="min-w-48 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500"
            />
            <select
              name="status"
              defaultValue={statusFilter || "all"}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
            >
              <option value="all">All statuses</option>
              <option value="queued">Queued</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Filter
            </button>
            {(q || statusFilter) && (
              <Link
                href="/admin/logs"
                className="text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-neutral-200">
            <thead className="border-b border-neutral-800 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Website</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Job ID</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-neutral-900/60 last:border-0 hover:bg-neutral-900/60"
                >
                  <td className="px-3 py-2 text-[11px] text-neutral-400">
                    {job.createdAt.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs capitalize text-neutral-100">
                    {job.status.toLowerCase()}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-300">
                    {job.type}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-200">
                    {job.website?.url ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-200">
                    {job.user?.email ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">
                    {job.id}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ActivityLogRowActions jobId={job.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
