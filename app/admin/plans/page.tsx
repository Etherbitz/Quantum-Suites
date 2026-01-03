import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";
import { AdminPlanTool, AdminCustomerPlanTool } from "@/components/admin";

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireAdmin();

  const resolvedSearchParams = await searchParams;

  const emailParam = resolvedSearchParams?.email;
  const idParam = resolvedSearchParams?.id;
  const clerkIdParam = resolvedSearchParams?.clerkId;

  const email = typeof emailParam === "string" ? emailParam : "";
  const id = typeof idParam === "string" ? idParam : "";
  const clerkId = typeof clerkIdParam === "string" ? clerkIdParam : "";

  let initialIdentifierType: "email" | "id" | "clerkId" = "email";
  let initialIdentifier = "";

  if (email) {
    initialIdentifierType = "email";
    initialIdentifier = email;
  } else if (id) {
    initialIdentifierType = "id";
    initialIdentifier = id;
  } else if (clerkId) {
    initialIdentifierType = "clerkId";
    initialIdentifier = clerkId;
  }

  const users = await prisma.user.findMany({
    select: { plan: true },
  });

  const counts: Record<string, number> = {};
  for (const user of users) {
    const key = (user.plan || "free").toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }

  const planKeys = Object.keys(PLANS) as Plan[];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-neutral-50">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Admin · Plans
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Plans & billing overview
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            See how many customers are on each tier and adjust plans when needed.
          </p>
        </div>
        <p className="text-[11px] text-neutral-500">
          Signed in as <span className="font-semibold">{admin.role}</span>
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {planKeys.map((plan) => (
          <div
            key={plan}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-50">
              {counts[plan] || 0}
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">
              Customers on this tier
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Admin can still change their own tier from here */}
        <AdminPlanTool currentPlan={"free"} />
        <AdminCustomerPlanTool
          initialIdentifierType={initialIdentifierType}
          initialIdentifier={initialIdentifier}
        />
      </div>
    </main>
  );
}
