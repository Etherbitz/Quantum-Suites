"use client";


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
import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";  
import { trackEvent } from "@/lib/analytics/track";   


function HeroSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 items-center">
        {/* Copy */}
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-cyan-600">
            Automated Website Compliance & Risk Monitoring
            <span className="block mt-2  text-indigo-300 ">
              for Small Businesses
            </span>
          </h1>

          <p className="mt-6 text-lg text-indigo-300 max-w-xl">
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
          <div className="h-80 w-full rounded-2xl border bg-gray-50 flex items-center justify-center text-gray-400">
            Compliance Dashboard Preview
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
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="
                rounded-xl
                border border-red-300
                bg-blue-50
                p-6
                shadow-sm font-bold text-red-600">
          Most Small Business Websites Are Legally Exposed
        </h2>

        <p className="mt-3 text-shadow-black">
          And most owners don’t know it until it becomes a problem.
        </p>

          <div className="
            rounded-2xl
            bg-white
            border border-gray-200
            shadow-sm
            p-6
            mt-10
            grid gap-6
            md:grid-cols-3
            text-gray-700
            
            ">
          <InfoCard text="Accessibility regulations are increasing" />
          <InfoCard text="Demand letters and lawsuits are becoming more common" />
          <InfoCard text="Most websites fail basic compliance checks without warning" />
        </div>

        <p className="mt-10 text-gray-700">
          You shouldn’t need to become a legal or technical expert to protect
          your business.
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
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-semibold text-orange-400">
          How Quantum Suites AI Protects You
        </h2>

        <div className="
              rounded-2xl
              bg-white
              border border-gray-200
              shadow-sm
              p-6
              transition
              hover:shadow-md
              hover:-translate-y-0.5">
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

        <p className="mt-12 font-bold text-emerald-900"> "
          No code • No setup • No guesswork
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
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-center">
          What We Monitor
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2 text-gray-700">
          <ul className="space-y-4">
            <li>• Website accessibility issues</li>
            <li>• Structural compliance risks</li>
            <li>• Changes that increase legal exposure</li>
            <li>• Ongoing compliance drift</li>
          </ul>

          <ul className="space-y-4">
            <li>• What’s at risk</li>
            <li>• What changed</li>
            <li>• What needs attention</li>
          </ul>
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
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-semibold">Pricing</h2>

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
 * Generic informational card.
 */
function InfoCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-gray-800">{text}</p>
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
    <div className="rounded-xl border p-6 bg-white">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
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
    // For free plan, go to scan page
    if (title === "Starter" || title === "Business") {
      window.location.href = "/pricing";
    } else if (title === "Agency") {
      // Coming soon - do nothing or show modal
      return;
    } else {
      // Free/default - go to scan
      window.location.href = "/scan";
    }
  };

  return (
    <div
      className={`rounded-2xl border p-8 ${
        highlight ? "border-blue-600 bg-blue-50" : "bg-white"
      }`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{subtitle}</p>
      <p className="mt-6 text-3xl font-semibold">{price}</p>

      <ul className="mt-6 space-y-3 text-left text-gray-700">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>

      <div className="mt-8">
        <button
          onClick={handleUpgrade}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={title === "Agency"}
        >
          {title === "Agency" ? "Coming Soon" : "Start Free Scan"}
        </button>
      </div>
    </div>
  );
}


{/* CTAs */}
<div className="mt-8 flex flex-wrap gap-4">
  <Link
    href="/scan"
    onClick={() =>
      trackEvent("cta_click", {
        page: "home",
        location: "hero",
        action: "scan",
      })
    }
  >
    <PrimaryButton>
      Scan My Website — Free
    </PrimaryButton>
  </Link>

  <Link
    href="/pricing"
    onClick={() =>
      trackEvent("cta_click", {
        page: "home",
        location: "hero",
        action: "pricing",
      })
    }
  >
    <SecondaryButton>
      View Pricing
    </SecondaryButton>
  </Link>
</div>


