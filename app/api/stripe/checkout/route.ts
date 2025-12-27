import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
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

    // Derive base app URL for redirect targets.
    // Falls back to the current request origin in development
    // if NEXT_PUBLIC_APP_URL is not defined.
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);

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
