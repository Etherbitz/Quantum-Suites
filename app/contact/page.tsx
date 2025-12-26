import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Contact Us | Quantum Suites AI",
  description:
    "Get in touch with the Quantum Suites AI team about pricing, onboarding, or support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row">
        <div className="max-w-xl space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              Contact
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Get in touch with the Quantum Suites AI team
            </h1>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Questions about plans, onboarding, or compliance scans? Send us a quick note
              and we&apos;ll point you in the right direction.
            </p>
          </header>

          <section className="space-y-5 text-sm leading-relaxed text-gray-700">
            <div>
              <h2 className="text-base font-semibold">Email</h2>
              <p className="mt-1 text-sm text-gray-700">
                All inquiries:&nbsp;
                <a
                  href="mailto:admin@quantumsuites-ai.com"
                  className="text-blue-600 underline"
                >
                  admin@quantumsuites-ai.com
                </a>
              </p>
            </div>

            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Typical response time
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  We aim to reply to most messages within one business day.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Best for
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  Plan questions, billing, onboarding help, and anything related to your
                  compliance reports.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              For security or privacy reports, please use the support email above with
              the subject line starting with <span className="font-semibold">[SECURITY]</span> or
              <span className="font-semibold"> [PRIVACY]</span>. Please avoid including sensitive
              personal data in your initial message.
            </p>

            <p className="text-xs text-gray-500">
              By contacting us you agree that we may use the details you provide to respond
              to your inquiry, in line with our&nbsp;
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>

        <aside className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-800">
          <h2 className="text-base font-semibold">Share a bit about your question</h2>
          <p className="mt-1 text-xs text-gray-600">
            This quick form helps us route your message to the right person.
          </p>

          <form
            className="mt-4 space-y-4"
            action="mailto:admin@quantumsuites-ai.com"
            method="post"
            encType="text/plain"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700"
              >
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="topic"
                className="block text-xs font-medium text-gray-700"
              >
                Topic
              </label>
              <select
                id="topic"
                name="topic"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                defaultValue="general"
              >
                <option value="general">General question</option>
                <option value="pricing">Pricing or plans</option>
                <option value="onboarding">Onboarding & setup</option>
                <option value="support">Product support</option>
                <option value="partnerships">Partnerships</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-medium text-gray-700"
              >
                How can we help?
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
            >
              Send message
            </button>

            <p className="text-[11px] text-gray-500">
              This form opens your default email client with the details you
              provide so you keep a copy of the message.
            </p>
          </form>
        </aside>
      </div>

      <Script
        id="contact-page-ldjson"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Quantum Suites AI",
            url: "http://www.quantumsuites-ai.com/contact",
            description:
              "Contact Quantum Suites AI for questions about website compliance scanning, pricing and support.",
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "admin@quantumsuites-ai.com",
                availableLanguage: ["en"],
              },
            ],
          }),
        }}
      />
    </main>
  );
}
