import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS, type Plan } from "@/lib/plans";
import { prisma } from "@/lib/db";
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

    const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
    const plan: Plan =
      rawPlan === "starter" ||
      rawPlan === "business" ||
      rawPlan === "agency"
        ? (rawPlan as Plan)
        : "free";

    const limits = PLANS[plan];

    const websitesUsed = await prisma.website.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      authenticated: true,
      plan: user.plan,
      websitesUsed,
      // JSON does not support Infinity; encode unlimited as -1
      websitesLimit:
        limits.websites === Infinity ? -1 : limits.websites,
    });
  } catch (error) {
    console.error("usage route error", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
