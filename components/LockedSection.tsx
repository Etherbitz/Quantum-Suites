import Link from "next/link";

/**
 * LockedSection
 *
 * Displays a gated CTA prompting the user to create an account
 * in order to unlock full scan results.
 */
export function LockedSection({ scanId }: { scanId: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        Unlock Full Compliance Report
      </h2>

      <p className="mt-3 text-gray-600">
        Create a free account to view all issues, save your scan,
        and monitor your website for future risks.
      </p>

      <Link
        href={`/sign-up?scanId=${scanId}`}
        className="
          mt-6
          inline-block
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-blue-700
        "
      >
        Create Free Account
      </Link>
    </section>
  );
}
