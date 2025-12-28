import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";

const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your subscription is now active",
};

export default async function BillingSuccessPage() {
  const { userId } = await auth();

  const userName = "there";
  let userPlan = "free";

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true },
    });

    if (user) {
      userPlan = user.plan;
    }
  }

  const planDisplay = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);
  const planConfig = PLANS[(userPlan as Plan) in PLANS ? (userPlan as Plan) : "free"];
  const planPrice = planConfig.price ?? 0;

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 via-blue-50 to-purple-50">
      <Script id="google-ads-purchase" strategy="afterInteractive">
        {`
          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'purchase', {
              value: ${planPrice},
              currency: 'USD',
              items: [
                {
                  item_id: '${planDisplay.toLowerCase()}',
                  item_name: '${planDisplay} Plan',
                },
              ],
            });
          }
        `}
      </Script>
      {GOOGLE_ADS_CONVERSION_ID && GOOGLE_ADS_CONVERSION_LABEL ? (
        <Script id="google-ads-signup" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
              window.gtag('event', 'sign_up', {
                send_to: '${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}',
                value: ${planPrice},
                currency: 'USD',
              });
            }
          `}
        </Script>
      ) : null}
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quantum Suites AI
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Success Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎉 Payment Successful!
          </h1>

          <p className="text-xl text-gray-700 mb-8">
            Welcome to the <span className="font-bold text-blue-600">{planDisplay} Plan</span>, {userName}!
          </p>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Your subscription is now active</h3>
                  <p className="text-gray-600 text-sm">You have full access to all {planDisplay} plan features</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Receipt sent to your email</h3>
                  <p className="text-gray-600 text-sm">Check your inbox for your payment confirmation</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Start monitoring now</h3>
                  <p className="text-gray-600 text-sm">Head to your dashboard to scan websites and view reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/scan"
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              Scan a Website
            </Link>
          </div>
        </div>
      </section>

      {/* What's Next Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You Can Do Now
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔍"
              title="Run Your First Scan"
              description="Analyze your website for compliance issues and get instant risk scores"
            />
            <FeatureCard
              icon="📊"
              title="View Detailed Reports"
              description="Access comprehensive compliance reports with actionable recommendations"
            />
            <FeatureCard
              icon="🔔"
              title="Set Up Monitoring"
              description="Enable continuous monitoring to catch issues before they become problems"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Feature card component
 */
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 border-2 border-blue-100">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
