import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PLANS } from "@/lib/plans";
import { NextResponse } from "next/server";

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

    const limits = PLANS[user.plan];

    return NextResponse.json({
      authenticated: true,
      plan: user.plan,
      websitesUsed: user.websitesUsed,
      websitesLimit: limits.websites,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
