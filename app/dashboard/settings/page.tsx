import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Stripe from "stripe";

import { prisma } from "@/lib/db";
import { PLANS, type Plan } from "@/lib/plans";
import { UsageMeter } from "@/components/common/UsageMeter";
import { DangerZone } from "@/components/dashboard/DangerZone";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
    return (
      <div className="max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-5 text-neutral-100">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Please sign in to view and manage your account settings.
        </p>
        <div className="mt-4">
          <Link
            href="/sign-in"
            className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/40 transition hover:bg-blue-500 hover:shadow-blue-400/60"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      websites: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    return (
      <div className="max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-5 text-neutral-100">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-neutral-400">
          We couldn&apos;t find your account record. Try signing out and back in.
        </p>
      </div>
    );
  }

  const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
  const planKey: Plan =
    rawPlan === "starter" ||
    rawPlan === "business" ||
    rawPlan === "agency"
      ? (rawPlan as Plan)
      : "free";
  const plan = PLANS[planKey];

  const websitesUsed = user.websites.length;
  const websitesLimit = plan.websites;

  // Look up the active Stripe subscription (if any) to show
  // a professional "Renews on" date in the account & plan panel.
  let subscriptionRenewalDate: string | null = null;

  if (planKey !== "free" && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      const customer = customers.data[0];

      if (customer) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active",
          limit: 1,
        });

        const subscription = subscriptions.data[0];

        if (subscription && subscription.current_period_end) {
          const date = new Date(subscription.current_period_end * 1000);
          subscriptionRenewalDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    } catch (err) {
      console.error("SETTINGS_SUBSCRIPTION_RENEWAL_LOOKUP_FAILED", err);
    }
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-neutral-800 bg-linear-to-r from-neutral-950 via-neutral-950 to-neutral-900 px-6 py-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Account
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">
              Settings & profile
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Keep your details, plan, and monitoring preferences up to date.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan
            </span>
            <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] text-neutral-300">
              Member since {user.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Profile
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Personal and business details used on invoices, alerts, and reports.
              </p>
            </div>
          </div>

          <ProfileForm
            initialProfile={{
              email:
                clerkUser.emailAddresses[0]?.emailAddress ?? user.email,
              firstName:
                (user as any).firstName ?? clerkUser.firstName ?? "",
              lastName:
                (user as any).lastName ?? clerkUser.lastName ?? "",
              company: (user as any).company ?? "",
              jobTitle: (user as any).jobTitle ?? "",
              phone:
                (user as any).phone ??
                (clerkUser.phoneNumbers?.[0]?.phoneNumber ?? ""),
              timezone: (user as any).timezone ?? "",
              locale: (user as any).locale ?? "",
              addressLine1: (user as any).addressLine1 ?? "",
              addressLine2: (user as any).addressLine2 ?? "",
              city: (user as any).city ?? "",
              state: (user as any).state ?? "",
              postalCode: (user as any).postalCode ?? "",
              country: (user as any).country ?? "",
              marketingOptIn: Boolean((user as any).marketingOptIn),
            }}
            canEditName={user.role === "ADMIN"}
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Account & plan
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Email</dt>
              <dd className="truncate text-right text-neutral-100">
                {clerkUser.emailAddresses[0]?.emailAddress}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-400">Plan</dt>
              <dd className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-900">
                  {planKey}
                </span>
                <Link
                  href="/pricing"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Change plan
                </Link>
              </dd>
            </div>
            {subscriptionRenewalDate && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-400">Renews on</dt>
                <dd className="text-right text-neutral-100">
                  {subscriptionRenewalDate}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 text-xs">
            <div className="mb-3 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Websites monitored</span>
              <span className="font-semibold text-neutral-100">
                {websitesUsed} / {websitesLimit === Infinity ? "∞" : websitesLimit}
              </span>
            </div>
            <UsageMeter />
            <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Scan frequency</span>
              <span className="font-semibold capitalize text-neutral-100">
                {plan.scanFrequency}
              </span>
            </div>
          </div>
        </div>
      </section>

      <DangerZone />
    </div>
  );
}


