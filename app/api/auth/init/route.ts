import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/track";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const runtime = "nodejs";

/**
 * API endpoint to initialize a new user in the database after signup.
 * Called from the signup completion page.
 */
export async function POST() {
  try {
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const emailFromClerk = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
    const emailFromClaims =
      typeof (sessionClaims as any)?.email === "string" ? (sessionClaims as any).email : null;

    // Create/update user record even if email is unavailable (fallback email will be used).
    const user = await getOrCreateUser(userId, emailFromClerk ?? emailFromClaims);

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
