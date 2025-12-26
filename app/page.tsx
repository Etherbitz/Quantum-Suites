"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";  
import { UpgradeButton } from "@/components/common/UpgradeButton";   

/**
 * Home page for Quantum Suites AI.
 * Primary conversion-focused landing page.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <MonitoringSection />
        <SocialProofSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <SiteFooter />
    </div>
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
    <section className="relative overflow-hidden bg-linear-to-b from-slate-950 via-slate-950 to-slate-950 px-6 py-24 text-white">
      {/* glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-60">
        <div className="h-64 w-64 rounded-full bg-cyan-500/40 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live compliance scoring
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Automated Website Compliance & Risk Monitoring
            </span>
            <span className="mt-3 block text-3xl text-neutral-200 md:text-4xl">
              for Small Businesses
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
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

          <p className="mt-3 text-sm text-neutral-400">
            No payment needed for your first scan • Takes under 60 seconds
          </p>
        </div>

        {/* Product Preview: live dashboard screenshot */}
        <div className="hidden items-center justify-center md:flex">
          <Link
            href="/scan"
            className="group relative block h-90 w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/40 bg-neutral-950/80 shadow-2xl shadow-cyan-500/30 transition-transform duration-500 ease-out hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/25 via-transparent to-violet-500/40 opacity-50" />

            <div className="relative h-full w-full rounded-2xl border border-neutral-800/70 bg-neutral-950 overflow-hidden">
              <Image
                src="/dashboard/hero.png"
                alt="Quantum Suites AI compliance dashboard"
                fill
                priority
                className="object-contain object-center"
              />
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-cyan-500/60 bg-neutral-950/85 px-4 py-2 text-[11px] text-neutral-200 shadow-md shadow-cyan-500/30">
              <span className="uppercase tracking-[0.16em] text-neutral-400">
                See inside the dashboard
              </span>
              <span className="text-cyan-300">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Logos / social proof strip */}
      <div className="relative mx-auto mt-10 max-w-5xl text-center text-xs text-neutral-500 md:text-sm">
        <p className="text-neutral-400">
          Quietly monitoring sites for teams at
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 opacity-80">
          <span className="font-medium tracking-wide text-neutral-200/90">
            Acme Studio
          </span>
          <span className="font-medium tracking-wide text-neutral-200/90">
            Northwind Labs
          </span>
          <span className="font-medium tracking-wide text-neutral-200/90">
            Aurora Legal
          </span>
          <span className="font-medium tracking-wide text-neutral-200/90">
            Lighthouse Digital
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Section explaining the risk problem faced by small businesses.
 */
function ProblemSection() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [highlightVisible, setHighlightVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHighlightVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-linear-to-b from-gray-50 to-white px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <div
          ref={cardRef}
          className={`inline-block transform-gpu transition-all duration-700 ease-out will-change-transform ${
            highlightVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-[0.97]"
          }`}
        >
          <div className="rounded-2xl border-2 border-red-400 bg-linear-to-br from-red-50 to-orange-50 px-8 py-6 shadow-xl shadow-red-200/80">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600">
              ⚠️ Most Small Business Websites Are Legally Exposed
            </h2>
          </div>
        </div>

        <p className="mt-8 text-2xl md:text-3xl text-gray-900 font-bold">
          And most owners don&apos;t know it until it becomes a problem.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <RiskCard 
            icon="📈"
            title="Accessibility regulations are increasing"
            description="WCAG, ADA, and privacy rules keep tightening while most sites stay frozen in time."
            gradient="from-blue-500 to-cyan-500"
          />
          <RiskCard 
            icon="⚖️"
            title="Demand letters and lawsuits are becoming more common"
            description="Plaintiff firms now use automated tools to find non-compliant sites and send demand letters at scale."
            gradient="from-purple-500 to-pink-500"
          />
          <RiskCard 
            icon="🔍"
            title="Most websites fail basic compliance checks without warning"
            description="Missing alt text, weak privacy notices, and broken flows quietly pile up until someone decides to look."
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <p className="mt-12 text-xl md:text-2xl text-gray-900 font-bold">
          You shouldn&apos;t need to become a legal or technical expert to protect your business.
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
    <section
      id="how-it-works"
      className="bg-slate-950 px-6 py-20"
    >
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-orange-400 mb-4">
          How Quantum Suites AI Protects You
        </h2>
        
        <p className="text-gray-300 mb-12">
          Every scan runs dozens of automated checks across accessibility, privacy, and security so you see issues before regulators or customers do.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            title="Scan Your Website"
            description="Point us at a URL and we crawl key pages for accessibility, privacy, and basic security issues. No code changes required."
          />
          <StepCard
            title="Get a Clear Risk Score"
            description="We turn raw findings into a single score and plain‑English summary so non‑technical stakeholders can understand the risk."
          />
            <StepCard
              title="Stay Monitored Automatically"
              description="Starter runs weekly scans. Business and Agency can keep sites on automatic daily monitoring with alerts when scores drop."
            />
        </div>

        <p className="mt-12 font-bold text-emerald-400 text-lg">
          &quot;No code • No setup • No guesswork&quot;
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
            description="Missing alt text, poor heading structure, unlabeled forms, and other WCAG 2.2 violations."
          />
          <MonitorCard 
            icon="🏗️"
            title="Structural compliance risks"
            description="Page templates, navigation, and document structure that make it hard for assistive tech to interpret your site."
          />
          <MonitorCard 
            icon="⚡"
            title="Changes that increase legal exposure"
            description="Score drops after content, theme, or plugin changes so you can catch risky updates early."
          />
          <MonitorCard 
            icon="📊"
            title="Ongoing compliance drift"
            description="Slow, hidden regressions in accessibility, privacy disclosures, and security headers over time."
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ReportCard 
            icon="🎯" 
            title="What&apos;s at risk" 
            description="See which pages, flows, and regulations are most likely to trigger complaints or audits."
          />
          <ReportCard 
            icon="📝" 
            title="What changed" 
            description="Compare scans to understand exactly what shifted between versions of your site."
          />
          <ReportCard 
            icon="🔔" 
            title="What needs attention" 
            description="A prioritized, plain-language list of fixes your team or agency can tackle next."
          />
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
    <section
      id="pricing"
      className="px-6 py-24 bg-linear-to-b from-gray-50 to-white"
    >
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 text-lg mb-3">Choose the plan that fits your needs</p>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-10">
           Free scan first • Cancel anytime • Privacy-first scanning
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
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
          />

          <PricingCard
            title="Business"
            price="$79/month"
            subtitle="For teams that want automated daily monitoring, alerts, and exportable evidence for stakeholders"
            highlight
            features={[
              "Monitor up to 10 websites with automated daily scanning",
              "Full WCAG, GDPR, and security issue breakdowns",
              "Change alerts when your risk score drops",
              "Downloadable CSV and HTML/PDF audit reports for stakeholders",
              "5 AI assistant sessions per month included",
            ]}
          />

          <PricingCard
            title="Agency"
            price="$199/month"
            subtitle="For agencies managing many client sites with branded reports and AI assistance"
            features={[
              "Unlimited client websites with automated daily monitoring",
              "Central, multi-site compliance dashboard",
              "White-label CSV and HTML/PDF reports for your clients",
              "AI assistant to help prioritize and fix issues (500 replies/month included)",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="border-y border-gray-100 bg-gray-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Trusted for peace of mind
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Teams use Quantum Suites AI to keep an eye on compliance without hiring extra staff.
          </p>
        </div>

        <div className="grid grid-cols-2 items-center gap-4 text-xs text-gray-500 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
            <div className="text-sm font-semibold text-gray-900">10k+</div>
            <div className="text-[11px] text-gray-500">Scans run</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
            <div className="text-sm font-semibold text-gray-900">24/7</div>
            <div className="text-[11px] text-gray-500">Monitoring</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
            <div className="text-sm font-semibold text-gray-900">90%</div>
            <div className="text-[11px] text-gray-500">Fix guidance coverage</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
            <div className="text-sm font-semibold text-gray-900">3 min</div>
            <div className="text-[11px] text-gray-500">Average setup</div>
          </div>
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
        <Link href="/scan">
          <PrimaryButton inverted>
            Scan My Website — Free
          </PrimaryButton>
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Risk warning card with gradient, icon, and hover details.
 */
function RiskCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-red-100 p-7 shadow-lg shadow-red-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-200/70">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-15 rounded-2xl transition-opacity duration-300`}
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="text-4xl mb-3 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        <p className="text-gray-900 font-semibold leading-relaxed">
          {title}
        </p>
        <p className="mt-3 text-xs text-gray-700 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-32 transition-all duration-300">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * Monitoring feature card.
 */
function MonitorCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl bg-gray-900/80 border border-gray-700 p-6 text-center shadow-md hover:shadow-xl hover:border-cyan-400/80 hover:bg-gray-900/95 transition-all hover:-translate-y-1">
      <div className="text-4xl mb-3 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <p className="text-gray-100 text-sm font-semibold leading-relaxed">
        {title}
      </p>
      <p className="mt-3 text-xs text-gray-300 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-300">
        {description}
      </p>
    </div>
  );
}

/**
 * Report feature card.
 */
function ReportCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 text-center hover:border-violet-400 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl">
      <div className="text-3xl mb-2 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <p className="text-gray-100 font-semibold text-sm">
        {title}
      </p>
      <p className="mt-3 text-xs text-gray-300 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-300">
        {description}
      </p>
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
  const planName = title.toLowerCase() as "starter" | "business" | "agency";

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
        <UpgradeButton
          plan={planName}
          label="Get Started"
          highlight={highlight}
          fullWidth={true}
        />
      </div>
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gray-900"
        >
          <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Quantum Suites AI
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
          <Link href="#how-it-works" className="hover:text-gray-900">
            How it works
          </Link>
          <Link href="#pricing" className="hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/scan" className="hover:text-gray-900">
            Run a scan
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-gray-700 hover:text-gray-900 md:inline"
          >
            Sign in
          </Link>
          <Link href="/sign-up">
            <PrimaryButton>Start free</PrimaryButton>
          </Link>
        </div>
      </div>
    </header>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            What customers say
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Builders, agencies, and owners use Quantum Suites AI to sleep better at night.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <TestimonialCard
            quote="Within a week we uncovered issues our lawyers had missed. The score made it easy to prioritize fixes."
            name="Alex G."
            role="Founder, DTC brand"
          />
          <TestimonialCard
            quote="Our agency runs scans before every launch now. It’s become part of our QA checklist."
            name="Maya R."
            role="Agency owner"
          />
          <TestimonialCard
            quote="The weekly monitoring emails are like a smoke alarm for compliance risk. Simple and actionable."
            name="Chris L."
            role="Head of Marketing"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="relative h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="absolute -top-4 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        2025 scan story
      </div>
      <blockquote className="mt-2 text-sm text-gray-700">
        “{quote}
      </blockquote>
      <figcaption className="mt-4 text-sm font-medium text-gray-900">
        {name}
        <span className="block text-xs font-normal text-gray-500">{role}</span>
      </figcaption>
    </figure>
  );
}

function FAQSection() {
  return (
    <section className="border-t border-gray-100 bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Everything you need to know before running your first scan.
          </p>
        </div>

        <dl className="mt-8 space-y-4 text-sm text-gray-700">
          <FAQItem
            question="Will this fix my site for me?"
            answer="Quantum Suites AI identifies issues and provides clear guidance on what to fix. Your developer, agency, or platform can then implement the changes."
          />
          <FAQItem
            question="Is this legal advice?"
            answer="No. We help you understand technical and content risks so you can have better conversations with your legal team."
          />
          <FAQItem
            question="How often do you rescan?"
            answer="Starter runs weekly scans, Business and above can monitor continuously with alerts when scores drop."
          />
          <FAQItem
            question="Do I need to install anything on my site?"
            answer="No. You just enter a URL. We scan from the outside, like a visitor or regulator would."
          />
          <FAQItem
            question="Can I cancel or change plans anytime?"
            answer="Yes. You can upgrade, downgrade, or cancel from your dashboard at any time. Changes take effect on your next billing cycle."
          />
          <FAQItem
            question="What kinds of sites can I scan?"
            answer="Most public marketing, docs, and app surfaces can be scanned. If parts of your product are behind a login or paywall, we recommend starting with your public‑facing pages first."
          />
          <FAQItem
            question="Will this slow down my website?"
            answer="No. Scans behave like a normal visitor loading your pages. We schedule automated scans to avoid putting unusual load on your servers."
          />
        </dl>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <dt className="font-semibold text-gray-900">{question}</dt>
      <dd className="mt-1 text-gray-600">{answer}</dd>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-6 text-xs text-gray-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
        <p>© {new Date().getFullYear()} Quantum Suites AI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-gray-700">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-700">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-gray-700">
            Contact us
          </Link>
          <Link href="/scan" className="hover:text-gray-700">
            Run a scan
          </Link>
        </div>
      </div>
    </footer>
  );
}
