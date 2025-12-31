import type { Metadata } from "next";
import { PricingCard, PricingFreeCta, PricingFooterScanCta } from "@/components/features/pricing";
import { UpgradeButton } from "@/components/common/UpgradeButton";
import { ManagePlanButton } from "@/components/common/ManagePlanButton";
import { getPlanRelation } from "@/lib/planRelations";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

  const relationToStarter = getPlanRelation("starter", currentPlan);
  const relationToBusiness = getPlanRelation("business", currentPlan);
  const relationToAgency = getPlanRelation("agency", currentPlan);

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="px-6 py-8 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-block mb-3">
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              💰 No Long-Term Contracts
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Protect Revenue While You Grow
            </span>
          </h1>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Start free, then upgrade when you&apos;re ready for automated monitoring,
            audit-ready reports, and AI help fixing issues before they hit revenue.
            <span className="font-semibold text-gray-900"> Stay compliant, win bigger deals, and cancel anytime — no contracts or hidden fees.</span>
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {/* Free (described but handled in-app as default) */}
          <PricingCard
            title="Free"
            price="$0"
            subtitle="Get a daily compliance health check for one site while you validate traction. No credit card required."
            features={[
              "Ideal for: validating a new site without legal surprises",
              "Run one automated scan per day to catch obvious risks early",
              "See your compliance score and top issues before prospects do",
              "Upgrade in one click when growth or investors demand more detail",
            ]}
            action={
              <PricingFreeCta />
            }
          />

          {/* Starter */}
          <PricingCard
            title="Starter"
            price="$29/month"
            subtitle="For single sites that need reliable, low-lift compliance coverage while revenue ramps."
            features={[
              "Ideal for: solo founders and small in-house teams",
              "Monitor one production site with weekly automated scans so launches stay live",
              "Cover core WCAG, GDPR, and baseline security checks to reduce legal risk",
              "Get plain‑English summaries that turn compliance issues into a clear fix list",
            ]}
            action={
              relationToStarter === "current" ? (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 py-3 text-sm font-semibold text-gray-500 shadow-inner"
                >
                  Current Plan
                </button>
              ) : relationToStarter === "downgrade" ? (
                <ManagePlanButton label="Downgrade to Starter" />
              ) : (
                <UpgradeButton
                  plan="starter"
                  label="Upgrade to Starter"
                  highlight
                />
              )
            }
          />

          {/* Business */}
          <PricingCard
            title="Business"
            price="$79/month"
            subtitle="For teams that need daily monitoring, alerts, and exportable evidence to protect revenue and close bigger deals."
            highlight
            features={[
              "Ideal for: in‑house legal, security, and marketing teams",
              "Monitor up to 10 key sites with automated daily scans so campaigns stay compliant",
              "Get alerts when your risk score drops so you can fix issues before they impact revenue",
              "Export CSV and HTML audit reports that help win security reviews and enterprise deals",
            ]}
            action={
              relationToBusiness === "current" ? (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 py-3 text-sm font-semibold text-gray-500 shadow-inner"
                >
                  Current Plan
                </button>
              ) : relationToBusiness === "downgrade" ? (
                <ManagePlanButton label="Downgrade to Business" />
              ) : (
                <UpgradeButton
                  plan="business"
                  label="Upgrade to Business"
                  highlight
                />
              )
            }
          />

          {/* Agency */}
          <PricingCard
            title="Agency"
            price="$199/month"
            subtitle="For agencies managing many client sites that need white‑label reporting, retention insurance, and AI assistance."
            features={[
              "Ideal for: agencies growing retainers with compliance as a service",
              "Monitor unlimited client websites with automated daily scanning so you spot issues before clients do",
              "Use a central, multi‑site compliance dashboard to prove ongoing value in QBRs",
              "Send white‑label CSV and HTML reports, backed by 500 AI replies/month to prioritize fixes and keep accounts safer",
            ]}
            action={
              relationToAgency === "current" ? (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 py-3 text-sm font-semibold text-gray-500 shadow-inner"
                >
                  Current Plan
                </button>
              ) : relationToAgency === "downgrade" ? (
                <ManagePlanButton label="Downgrade to Agency" />
              ) : (
                <UpgradeButton
                  plan="agency"
                  label="Upgrade to Agency"
                  highlight
                />
              )
            }
          />
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">30-day money back</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQItem
              question="Can I try before I buy?"
              answer="Yes! Start with our free scan to see your compliance risk score. No credit card required."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards including Visa, Mastercard, American Express, and Discover."
            />
            <FAQItem
              question="Can I change or cancel my plan?"
              answer="Absolutely. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. No long-term commitments."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Still Not Sure? Try It Free
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get your compliance risk score in 60 seconds — no credit card required
          </p>
          <PricingFooterScanCta />
        </div>
      </section>
    </main>
  );
}

/**
 * FAQ Item Component
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-linear-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-blue-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-700 leading-relaxed">{answer}</p>
    </div>
  );
}
