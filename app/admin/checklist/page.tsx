import { requireAdmin } from "@/lib/adminGuard";
import { redirect } from "next/navigation";

export default async function AdminFunnelChecklistPage() {
  await requireAdmin();

  redirect("/dashboard/admin/checklist");
}
