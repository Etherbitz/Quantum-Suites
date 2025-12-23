import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { NextResponse } from "next/server";

const ALLOWED_PLANS = ["starter", "business", "agency"] as const;

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

  const { plan } = await req.json();

  if (!ALLOWED_PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "INVALID_PLAN" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan },
  });

  return NextResponse.json({ success: true, plan });
}
