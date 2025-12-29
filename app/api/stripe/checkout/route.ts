import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe checkout misconfigured: missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // Initialize Stripe at request time to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const { priceId, planName } = await req.json();

    if (!priceId || !planName) {
      return NextResponse.json(
        { error: "Missing priceId or planName" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    // Require basic billing profile details before starting a paid subscription.
    // Free accounts can exist without this, but upgrades must have it filled in.
    const requiredFields: Array<{
      key: keyof typeof user;
      label: string;
    }> = [
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "addressLine1", label: "Street address" },
      { key: "city", label: "City" },
      { key: "state", label: "State / region" },
      { key: "postalCode", label: "Postal code" },
      { key: "country", label: "Country" },
    ] as any;

    const missing = requiredFields
      .filter(({ key }) => {
        const raw = (user as any)[key];
        if (typeof raw !== "string") return true;
        return raw.trim().length === 0;
      })
      .map((f) => f.label);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "PROFILE_INCOMPLETE",
          code: "PROFILE_INCOMPLETE",
          missingFields: missing,
          message:
            "Please complete your billing profile (name and address) before upgrading.",
        },
        { status: 400 }
      );
    }

    // Derive base app URL for redirect targets.
    // Falls back to the current request origin in development
    // if NEXT_PUBLIC_APP_URL is not defined.
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    // Create Stripe checkout session with a dedicated Sentry span
    const session = await Sentry.startSpan(
      {
        name: "stripe.checkout.sessions.create",
        op: "stripe",
        attributes: {
          planName,
        },
      },
      async () =>
        stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planName: planName,
          },
          success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/pricing`,
          subscription_data: {
            metadata: {
              userId: user.id,
              planName: planName,
            },
          },
        })
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    Sentry.captureException(error);

    let message = "Failed to create checkout session";
    if (typeof error === "object" && error && "message" in error) {
      message = (error as { message?: string }).message || message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
