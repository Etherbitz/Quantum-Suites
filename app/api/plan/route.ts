import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { NextResponse } from "next/server";

const ALLOWED_PLANS = ["free", "starter", "business", "agency"] as const;
type AllowedPlan = (typeof ALLOWED_PLANS)[number];

export async function POST(req: Request) {
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

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const requestedPlan = String(body.plan || "").toLowerCase() as AllowedPlan;

  if (!ALLOWED_PLANS.includes(requestedPlan)) {
    return NextResponse.json(
      { error: "INVALID_PLAN" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: requestedPlan },
  });

  return NextResponse.json({ success: true, plan: requestedPlan });
}
