import Link from "next/link";
import type { Metadata } from "next";
import { PricingCard } from "@/components/PricingCard";
import { UpgradeButton } from "@/components/UpgradeButton";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for automated website compliance monitoring.",
  alternates: {
    canonical: "https://quantumsuites.ai/pricing",
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

  return (
    <main className="px-6 py-24 bg-neutral-950">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-12 shadow-2xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Pricing</span>
        </nav>

        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-900">
            Pricing
          </h1>

          <p className="mt-4 text-gray-600">
            Simple pricing designed for small businesses. No long-term contracts.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {/* Starter */}
          <PricingCard
            title="Starter"
            price="$29/month"
            subtitle="For small websites getting started"
            features={[
              "1 website",
              "Weekly compliance scans",
              "Risk score & summary report",
            ]}
            action={
              currentPlan === "starter" ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-gray-200 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <UpgradeButton
                  plan="starter"
                  label="Upgrade to Starter"
                />
              )
            }
          />

          {/* Business */}
          <PricingCard
            title="Business"
            price="$79/month"
            subtitle="Most Popular"
            highlight
            features={[
              "Continuous monitoring",
              "Detailed compliance reports",
              "Change alerts",
              "Downloadable audit trail",
            ]}
            action={
              currentPlan === "business" ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-gray-200 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <UpgradeButton
                  plan="business"
                  label="Upgrade to Business"
                />
              )
            }
          />

          {/* Agency */}
          <PricingCard
            title="Agency"
            price="Coming Soon"
            subtitle="For agencies and multi-site owners"
            features={[
              "Multiple websites",
              "Central dashboard",
              "White-label reporting",
            ]}
            action={
              <button
                disabled
                className="w-full rounded-lg bg-gray-200 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                Coming Soon
              </button>
            }
          />
        </div>
      </div>
    </main>
  );
}
