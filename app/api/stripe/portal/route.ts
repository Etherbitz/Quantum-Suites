import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe portal misconfigured: missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    // Look up existing Stripe customer by email.
    const customers = await Sentry.startSpan(
      {
        name: "stripe.customers.list",
        op: "stripe",
      },
      async () =>
        stripe.customers.list({
          email: user.email,
          limit: 1,
        })
    );

    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json(
        { error: "NO_STRIPE_CUSTOMER" },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const session = await Sentry.startSpan(
      {
        name: "stripe.billingPortal.sessions.create",
        op: "stripe",
      },
      async () =>
        stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: `${baseUrl}/pricing`,
        })
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
