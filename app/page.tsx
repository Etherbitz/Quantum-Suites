"use client";

import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";  
import { trackEvent } from "@/lib/analytics/track";   

/**
 * Home page for Quantum Suites AI.
 * Primary conversion-focused landing page.
 */
export default function HomePage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <MonitoringSection />
      <PricingSection />
      <FinalCTASection />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   SECTIONS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Hero section introducing the product and primary call-to-action.
 */
function HeroSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 items-center">
        {/* Copy */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Automated Website Compliance & Risk Monitoring
            </span>
            <span className="block mt-3 text-3xl md:text-4xl text-gray-700">
              for Small Businesses
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-xl leading-relaxed">
            Know where you stand. Reduce legal exposure. Stay compliant
            automatically — without legal or technical complexity.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/scan">
              <PrimaryButton>
                Scan My Website — Free
              </PrimaryButton>
            </Link>

            <Link href="/pricing">
              <SecondaryButton>
                View Pricing
              </SecondaryButton>
            </Link>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            No credit card required • Takes under 60 seconds
          </p>
        </div>

        {/* Product Preview Placeholder */}
        <div className="hidden md:flex items-center justify-center">
          <div className="h-80 w-full rounded-2xl border-2 border-blue-200 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center text-gray-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-12 bg-linear-to-r from-blue-600 to-indigo-600 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mt-8 text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">95</div>
              <div className="text-sm font-semibold text-gray-600">Compliance Score</div>
              <div className="mt-4 flex gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Low Risk</div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Section explaining the risk problem faced by small businesses.
 */
function ProblemSection() {
  return (
    <section className="bg-linear-to-b from-gray-50 to-white px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-block">
          <div className="rounded-2xl border-2 border-red-400 bg-linear-to-br from-red-50 to-orange-50 px-8 py-6 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600">
              ⚠️ Most Small Business Websites Are Legally Exposed
            </h2>
          </div>
        </div>

        <p className="mt-8 text-2xl md:text-3xl text-gray-900 font-bold">
          And most owners don't know it until it becomes a problem.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <RiskCard 
            icon="📈"
            title="Accessibility regulations are increasing"
            gradient="from-blue-500 to-cyan-500"
          />
          <RiskCard 
            icon="⚖️"
            title="Demand letters and lawsuits are becoming more common"
            gradient="from-purple-500 to-pink-500"
          />
          <RiskCard 
            icon="🔍"
            title="Most websites fail basic compliance checks without warning"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <p className="mt-12 text-xl md:text-2xl text-gray-900 font-bold">
          You shouldn't need to become a legal or technical expert to protect your business.
        </p>
      </div>
    </section>
  );
}

/**
 * Step-by-step explanation of how the product works.
 */
function HowItWorksSection() {
  return (
    <section className="bg-black px-6 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-orange-400 mb-4">
          How Quantum Suites AI Protects You
        </h2>
        
        <p className="text-gray-300 mb-12">
          We analyze your site for common accessibility and compliance risks.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            title="Scan Your Website"
            description="We analyze your site for common accessibility and compliance risks."
          />
          <StepCard
            title="Get a Clear Risk Score"
            description="Understand whether your site is low, medium, or high risk in plain English."
          />
          <StepCard
            title="Stay Monitored Automatically"
            description="We continuously scan your site and alert you when risks increase."
          />
        </div>

        <p className="mt-12 font-bold text-emerald-400 text-lg">
          " No code • No setup • No guesswork
        </p>
      </div>
    </section>
  );
}

/**
 * Section describing monitored risk categories and reports.
 */
function MonitoringSection() {
  return (
    <section className="bg-linear-to-b from-blue-900 via-indigo-900 to-purple-900 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          What We Monitor
        </h2>
        <p className="text-center text-blue-200 text-lg mb-12">Comprehensive protection across all compliance areas</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MonitorCard 
            icon="♿"
            title="Website accessibility issues"
            color="blue"
          />
          <MonitorCard 
            icon="🏗️"
            title="Structural compliance risks"
            color="purple"
          />
          <MonitorCard 
            icon="⚡"
            title="Changes that increase legal exposure"
            color="orange"
          />
          <MonitorCard 
            icon="📊"
            title="Ongoing compliance drift"
            color="green"
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ReportCard icon="🎯" text="What's at risk" />
          <ReportCard icon="📝" text="What changed" />
          <ReportCard icon="🔔" text="What needs attention" />
        </div>
      </div>
    </section>
  );
}

/**
 * Pricing section with tiered plans.
 */
function PricingSection() {
  return (
    <section className="px-6 py-24 bg-linear-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 text-lg mb-14">Choose the plan that fits your needs</p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <PricingCard
            title="Starter"
            price="$29/month"
            subtitle="For small websites getting started"
            features={[
              "1 website",
              "Weekly compliance scans",
              "Risk score & summary report",
            ]}
          />

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
          />

          <PricingCard
            title="Agency"
            price="Coming Soon"
            subtitle="For agencies and multi-site owners"
            features={[
              "Multiple websites",
              "Central dashboard",
              "White-label reporting",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Final conversion call-to-action section.
 */
function FinalCTASection() {
  return (
    <section className="bg-blue-600 px-6 py-20 text-center text-white">
      <h2 className="text-3xl font-semibold">
        Know Your Risk Before It Becomes a Problem
      </h2>

      <p className="mt-4 text-blue-100">
        Instant results • No obligation
      </p>

      <div className="mt-8">
        <PrimaryButton inverted>
          Scan My Website — Free
        </PrimaryButton>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Risk warning card with gradient and icon.
 */
function RiskCard({ icon, title, gradient }: { icon: string; title: string; gradient: string }) {
  return (
    <div className="group relative rounded-2xl bg-white border-2 border-gray-200 p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
      <div className="relative text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <p className="text-gray-800 font-medium leading-relaxed">{title}</p>
      </div>
    </div>
  );
}

/**
 * Monitoring feature card.
 */
function MonitorCard({ icon, title, color }: { icon: string; title: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500'
  };
  
  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 hover:border-gray-500 transition-all hover:scale-105 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-300 text-sm font-medium leading-relaxed">{title}</p>
    </div>
  );
}

/**
 * Report feature card.
 */
function ReportCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-xl bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 text-center hover:border-blue-500 transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-300 font-medium">{text}</p>
    </div>
  );
}

/**
 * Step card used in "How It Works" section.
 */
function StepCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-gray-700 p-8 bg-gray-900 text-left hover:border-orange-400 transition-all hover:scale-105">
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * Pricing tier card.
 */
function PricingCard({
  title,
  price,
  subtitle,
  features,
  highlight = false,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
}) {
  const handleUpgrade = () => {
    if (title === "Starter" || title === "Business") {
      window.location.href = "/pricing";
    } else if (title === "Agency") {
      return;
    } else {
      window.location.href = "/scan";
    }
  };

  return (
    <div className="relative">
      <div
        className={`rounded-2xl border-2 p-8 transition-all hover:scale-105 hover:shadow-2xl ${
          highlight 
            ? "border-blue-500 bg-linear-to-br from-blue-50 to-indigo-50 shadow-xl scale-105" 
            : "border-gray-200 bg-white shadow-lg"
        }`}
      >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="relative">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        <div className="mt-6 mb-8">
          <span className="text-5xl font-bold text-gray-900">{price.includes('$') ? price.split('/')[0] : price}</span>
          {price.includes('/') && <span className="text-gray-600 text-lg">/month</span>}
        </div>

        <ul className="space-y-4 text-left text-gray-700 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleUpgrade}
          className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all ${
            highlight
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
              : "bg-gray-900 text-white hover:bg-gray-800"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={title === "Agency"}
        >
          {title === "Agency" ? "Coming Soon" : "Get Started"}
        </button>
      </div>
      </div>
    </div>
  );
}
