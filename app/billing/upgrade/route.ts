import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { PLANS, type Plan } from "@/lib/plans";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe upgrade misconfigured: missing STRIPE_SECRET_KEY");
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const url = new URL(req.url);
    const planParam = url.searchParams.get("plan");

    if (!planParam) {
      return NextResponse.redirect(new URL("/pricing", url.origin));
    }

    const planKey = planParam.toLowerCase() as Plan;

    if (!(planKey in PLANS)) {
      console.error("Invalid plan in upgrade route", { planParam });
      return NextResponse.redirect(new URL("/pricing", url.origin));
    }

    const planConfig = PLANS[planKey];
    const stripePriceId = planConfig.stripePriceId;

    if (!stripePriceId) {
      console.error("Missing Stripe price ID for plan", { planKey });
      return NextResponse.redirect(
        new URL("/pricing?error=plan_unavailable", url.origin)
      );
    }

    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      // If somehow hit without auth (e.g. link manually opened), send through sign-up
      const redirectTarget = `/billing/upgrade?plan=${encodeURIComponent(
        planKey
      )}`;
      const signUpUrl = new URL(
        `/sign-up?redirect_url=${encodeURIComponent(redirectTarget)}`,
        url.origin
      );
      return NextResponse.redirect(signUpUrl);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const session = await Sentry.startSpan(
      {
        name: "stripe.checkout.sessions.create",
        op: "stripe",
        attributes: {
          planName: planKey,
          source: "billing_upgrade_route",
        },
      },
      async () =>
        stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [
            {
              price: stripePriceId,
              quantity: 1,
            },
          ],
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planName: planKey,
          },
          success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/pricing`,
          subscription_data: {
            metadata: {
              userId: user.id,
              planName: planKey,
            },
          },
        })
    );

    if (session.url) {
      return NextResponse.redirect(session.url);
    }

    console.error("Stripe session missing URL in upgrade route", {
      sessionId: session.id,
    });

    return NextResponse.redirect(new URL("/pricing", baseUrl));
  } catch (error) {
    console.error("Stripe upgrade route error:", error);
    Sentry.captureException(error);
    return NextResponse.redirect(new URL("/pricing?error=checkout_failed", req.url));
  }
}
