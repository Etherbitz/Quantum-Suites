import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_PLANS = ["free", "starter", "business", "agency"] as const;
type AllowedPlan = (typeof ALLOWED_PLANS)[number];

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const plan = String(body.plan || "").toLowerCase() as AllowedPlan;
  const email = body.email ? String(body.email).trim() : undefined;
  const id = body.id ? String(body.id).trim() : undefined;
  const clerkId = body.clerkId ? String(body.clerkId).trim() : undefined;

  if (!ALLOWED_PLANS.includes(plan)) {
    return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
  }

  if (!email && !id && !clerkId) {
    return NextResponse.json(
      { error: "MISSING_IDENTIFIER", message: "Provide email, id, or clerkId" },
      { status: 400 }
    );
  }

  let target = null;

  if (id) {
    target = await prisma.user.findUnique({ where: { id } });
  } else if (clerkId) {
    target = await prisma.user.findUnique({ where: { clerkId } });
  } else if (email) {
    target = await prisma.user.findFirst({ where: { email } });
  }

  if (!target) {
    return NextResponse.json(
      { error: "USER_NOT_FOUND", message: "No user matched the given identifier" },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { plan },
    select: { id: true, email: true, clerkId: true, plan: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
