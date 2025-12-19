import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Initialize Stripe at request time to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planName = session.metadata?.planName;

  if (!userId || !planName) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Update user's plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: planName.toLowerCase(),
    },
  });

  console.log(`User ${userId} upgraded to ${planName}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planName = subscription.metadata?.planName;

  if (!userId || !planName) {
    console.error("Missing metadata in subscription");
    return;
  }

  // Update user's plan based on subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: subscription.status === "active" ? planName.toLowerCase() : "free",
    },
  });

  console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription");
    return;
  }

  // Downgrade user to free plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "free",
    },
  });

  console.log(`Subscription cancelled for user ${userId}, downgraded to free`);
}
