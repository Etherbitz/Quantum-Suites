import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS, type Plan } from "@/lib/plans";
import { NextResponse } from "next/server";

/**
 * Retrieves the current user's usage and plan information.
 * 
 * Authenticates the user via Clerk and fetches their account details including
 * plan type and resource limits.
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - `authenticated` (boolean): Whether the user is authenticated
 *   - `plan` (string): The user's current plan type
 *   - `websitesUsed` (number): Number of websites currently used by the user
 *   - `websitesLimit` (number): Maximum number of websites allowed for the user's plan
 * 
 * @throws Returns `{ authenticated: false }` with status 200 if authentication fails
 *         or an error occurs during processing
 */
export async function GET() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    const user = await getOrCreateUser(
      userId,
      clerkUser.emailAddresses[0].emailAddress
    );

    const plan = (user.plan in PLANS
  ? user.plan
  : "free") as Plan;

    const limits = PLANS[plan];

    const websitesUsed = user.websitesUsed;

    return NextResponse.json({
      authenticated: true,
      plan: user.plan,
      websitesUsed,
      websitesLimit: limits.websites,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
