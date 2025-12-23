import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Quantum Suites AI",
  description:
    "Get in touch with the Quantum Suites AI team about pricing, onboarding, or support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
          <p className="mt-2 text-sm text-gray-600">
            Questions about plans, onboarding, or compliance scans? We&apos;d love to help.
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-gray-700">
          <div>
            <h2 className="text-base font-semibold">Email</h2>
            <p className="mt-1">
              General questions:
              {" "}
              <a
                href="mailto:hello@quantumsuites.ai"
                className="text-blue-600 underline"
              >
                hello@quantumsuites.ai
              </a>
            </p>
            <p className="mt-1">
              Support:
              {" "}
              <a
                href="mailto:support@quantumsuites.ai"
                className="text-blue-600 underline"
              >
                support@quantumsuites.ai
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold">How we respond</h2>
            <p className="mt-1">
              We aim to respond to most messages within one business day. For urgent
              production issues, please include &quot;URGENT&quot; in your subject line so we can
              prioritize the ticket.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
