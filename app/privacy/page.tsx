import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Quantum Suites AI",
  description:
    "Learn how Quantum Suites AI collects, uses, and protects data for compliance scanning.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-600">
            Effective date: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            Quantum Suites AI is a website compliance monitoring service. We analyze public
            website content and technical signals (like HTML, headings, and security headers)
            to help our customers understand accessibility, privacy, and security risks.
          </p>
          <p>
            When you create an account, we collect basic profile information such as your
            name, email address, and company details. We use this information to operate the
            product, send important account notices, and measure usage.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details provided by you (for example name, email, company).</li>
            <li>Usage data about how you run scans and interact with dashboards.</li>
            <li>
              Scan results derived from public webpages you ask us to analyze (including
              HTML structure, headings, links, and security headers).
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">How we use data</h2>
          <p>
            We use your information to provide and improve the service, including running
            scans, storing historical results, generating alerts, and helping you understand
            changes in your compliance posture over time.
          </p>
          <p>
            We do not sell your personal information. We may use third‑party processors
            (such as hosting, logging, and analytics providers) to operate the product, and
            we require them to protect your data.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Your choices</h2>
          <p>
            You can update your profile information or close your account at any time. If
            you close your account, we will delete or de‑identify personal information that
            we no longer need for legitimate business or legal purposes.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p>
            If you have questions about this policy or how we handle data, please contact us
            at <a href="mailto:privacy@quantumsuites.ai" className="text-blue-600 underline">privacy@quantumsuites.ai</a>.
          </p>
        </section>

        <p className="text-xs text-gray-500">
          This page is a general product privacy overview and is not legal advice.
        </p>

        <p className="text-xs text-gray-500">
          Go back to the <Link href="/" className="underline">home page</Link>.
        </p>
      </div>
    </main>
  );
}
