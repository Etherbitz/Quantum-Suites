import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Quantum Suites AI",
  description:
    "Read the terms that apply when you use Quantum Suites AI for website compliance scanning.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-600">
            Effective date: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            By using Quantum Suites AI, you agree to these terms. If you&apos;re using the
            product on behalf of a company or organization, you confirm that you have
            authority to accept these terms for that organization.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Service description</h2>
          <p>
            Quantum Suites AI analyzes public websites that you specify and reports on
            potential accessibility, privacy, and security issues. We do not guarantee
            compliance with any law or standard, and our findings should be reviewed by your
            legal and compliance teams.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Your responsibilities</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Only scan websites and properties you have the right to test.</li>
            <li>
              Do not use the service to store or transmit sensitive personal data beyond what
              is necessary to operate your account.
            </li>
            <li>You are responsible for how you act on any recommendations we provide.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Disclaimers</h2>
          <p>
            The service is provided on an &quot;as is&quot; basis without warranties of any kind. We do
            not promise that scan results are exhaustive, error‑free, or sufficient to meet
            any regulatory requirement.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p>
            If you have questions about these terms, please contact us at
            {" "}
            <a href="mailto:legal@quantumsuites.ai" className="text-blue-600 underline">
              legal@quantumsuites.ai
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-gray-500">
          Go back to the <Link href="/" className="underline">home page</Link>.
        </p>
      </div>
    </main>
  );
}
