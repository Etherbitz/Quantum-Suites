import Link from "next/link";
import type { Metadata } from "next";
import { PricingCard } from "@/components/common/PricingCard";
import { UpgradeButton } from "@/components/common/UpgradeButton";
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
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quantum Suites AI
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/scan" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Free Scan
            </Link>
            <Link href="/sign-up" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

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
              Simple, Transparent Pricing
            </span>
          </h1>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Choose the plan that fits your needs. 
            <span className="font-semibold text-gray-900"> Cancel anytime, no questions asked.</span>
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
          {/* Starter */}
          <PricingCard
            title="Starter"
            price="$29/month"
            subtitle="For single sites that need a basic compliance health check"
            features={[
              "Monitor 1 website",
              "Weekly compliance scans & refreshed score",
              "WCAG, GDPR, and security basics",
              "Plain-language summary of top issues",
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
             subtitle="For teams that need continuous monitoring, audit-ready history, and a taste of AI help"
            highlight
            features={[
               "Monitor up to 10 websites with continuous scanning",
               "Full WCAG, GDPR, and security issue breakdowns",
               "Change alerts when your risk score drops",
               "Downloadable CSV audit trail for stakeholders",
               "5 AI assistant sessions per month included",
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
            price="$199/month"
            subtitle="For agencies managing many client sites with AI assistance"
            features={[
               "Unlimited client websites",
               "Central, multi-site compliance dashboard",
               "White-label, exportable reports for your clients",
               "AI assistant to help prioritize and fix issues (500 replies/month included)",
            ]}
            action={
              currentPlan === "agency" ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-gray-200 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <UpgradeButton
                  plan="agency"
                  label="Upgrade to Agency"
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
          <a href="/scan" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Start Free Scan
          </a>
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
