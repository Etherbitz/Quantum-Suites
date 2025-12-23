import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { redirect } from "next/navigation";

import ResultsClient from "./ResultsClient";
import type { Plan } from "@/lib/plans";

export default async function ResultsShell({
  searchParams,
}: {
  searchParams?: Promise<{
    scanId?: string;
    id?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  const scanId =
    resolvedSearchParams?.scanId ??
    resolvedSearchParams?.id;

  if (!scanId) {
    redirect("/scan");
  }

  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;

  let plan: Plan = "free";
  let dbUserId: string | null = null;

  if (userId && clerkUser?.emailAddresses?.[0]?.emailAddress) {
    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );
    const rawPlan = user.plan?.toLowerCase();

    if (rawPlan === "pro" || rawPlan === "business") {
      // Treat legacy "pro" as the current "business" tier
      plan = "business";
    } else if (
      rawPlan === "starter" ||
      rawPlan === "agency" ||
      rawPlan === "free"
    ) {
      plan = rawPlan as Plan;
    } else {
      plan = "free";
    }
    dbUserId = user.id;
  }

  const scan = await prisma.scanJob.findUnique({
    where: { id: scanId },
    include: {
      website: {
        select: { url: true },
      },
    },
  });

  if (!scan) {
    redirect("/scan");
  }

  return (
    <ResultsClient
      scan={scan}
      plan={plan}
      isAuthenticated={!!dbUserId}
    />
  );
}   