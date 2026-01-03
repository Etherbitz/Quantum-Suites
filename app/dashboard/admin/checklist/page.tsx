import { requireAdmin } from "@/lib/adminGuard";
import ChecklistClient from "@/app/admin/checklist/ChecklistClient";

export default async function DashboardAdminFunnelChecklistPage() {
  await requireAdmin();

  return (
    <section className="w-full max-w-5xl text-neutral-50">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Admin · Diagnostics
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Testing
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          Quick tests for the critical user journey: auth → anonymous scan → attach-on-signup.
        </p>
      </header>

      <ChecklistClient />
    </section>
  );
}
