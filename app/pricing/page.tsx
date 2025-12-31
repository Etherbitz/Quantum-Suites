import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { PricingPageClient } from "@/components/features/pricing/PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for automated website compliance monitoring.",
  alternates: {
    canonical: "https://www.quantumsuites-ai.com/pricing",
  },
};

export default async function PricingPage() {
  const { userId } = await auth();

  let currentPlan: string | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true },
    });

    currentPlan = user?.plan ?? null;
  }
  return <PricingPageClient currentPlan={currentPlan} />;
}
