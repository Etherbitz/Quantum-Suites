import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const admin = await requireAdmin();

  const qRaw = searchParams?.q;
  const planFilterRaw = searchParams?.plan;
  const roleFilterRaw = searchParams?.role;

  const q = typeof qRaw === "string" ? qRaw.trim() : "";
  const planFilter =
    typeof planFilterRaw === "string" && planFilterRaw !== "all"
      ? planFilterRaw
      : "";
  const roleFilter =
    typeof roleFilterRaw === "string" && roleFilterRaw !== "all"
      ? roleFilterRaw
      : "";

  const where: any = {};

  if (q) {
    where.OR = [
      {
        email: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        id: {
          contains: q,
        },
      },
      {
        plan: {
          contains: q.toLowerCase(),
          mode: "insensitive",
        },
      },
      {
        role: {
          equals: q.toUpperCase(),
        },
      },
    ];
  }

  if (planFilter) {
    where.plan = planFilter.toLowerCase();
  }

  if (roleFilter) {
    where.role = roleFilter.toUpperCase();
  }

  const users = await prisma.user.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      plan: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-neutral-50">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Admin · Customers
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Customer accounts
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Recent users, their plans, and when they joined.
          </p>
        </div>
        <p className="text-[11px] text-neutral-500">
          Signed in as <span className="font-semibold">{admin.role}</span>
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <form
          className="mb-3 flex flex-col gap-3 text-xs text-neutral-400 md:flex-row md:items-center md:justify-between"
          method="GET"
        >
          <p>
            Showing latest {users.length} users
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search email, plan, role, ID"
              className="min-w-48 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500"
            />
            <select
              name="plan"
              defaultValue={planFilter || "all"}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
            >
              <option value="all">All plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="business">Business</option>
              <option value="agency">Agency</option>
            </select>
            <select
              name="role"
              defaultValue={roleFilter || "all"}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
            >
              <option value="all">All roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Filter
            </button>
            {(q || planFilter || roleFilter) && (
              <a
                href="/admin/users"
                className="text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                Reset
              </a>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-neutral-200">
            <thead className="border-b border-neutral-800 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-neutral-900/60 last:border-0 hover:bg-neutral-900/60"
                >
                  <td className="px-3 py-2 text-xs text-neutral-100">
                    {user.email}
                  </td>
                  <td className="px-3 py-2 text-xs capitalize text-neutral-200">
                    {user.plan}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-300">
                    {user.role}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">
                    {user.id}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-neutral-400">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    <a
                      href={`/admin/plans?email=${encodeURIComponent(
                        user.email
                      )}`}
                      className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-100 hover:border-emerald-500 hover:text-emerald-200"
                    >
                      Manage plan
                    </a>
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
