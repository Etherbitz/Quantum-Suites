import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics/track";

/**
 * API endpoint to initialize a new user in the database after signup.
 * Called from the signup completion page.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0].emailAddress;

    // Create or update user record
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        updatedAt: new Date(),
      },
      create: {
        clerkId: userId,
        email,
        plan: "free",
        websitesUsed: 0,
      },
    });

    // Track signup event
    await trackEvent("user_signup_completed", {
      userId: user.id,
      plan: user.plan,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Failed to initialize user" },
      { status: 500 }
    );
  }
}
