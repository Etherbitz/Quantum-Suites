import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { PLAN_ALERT_CONFIG } from "@/lib/alerts/planAlertConfig";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { value } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const rawPlan = typeof user.plan === "string" ? user.plan.toLowerCase() : "free";
  const plan: keyof typeof PLAN_ALERT_CONFIG =
    rawPlan === "starter" ||
    rawPlan === "business" ||
    rawPlan === "agency"
      ? (rawPlan as keyof typeof PLAN_ALERT_CONFIG)
      : "free";

  const planConfig = PLAN_ALERT_CONFIG[plan];

  // 🔒 Free users cannot set thresholds
  if (!planConfig.enabled) {
    return NextResponse.json(
      { error: "Upgrade required" },
      { status: 403 }
    );
  }

  // Clamp value to sane bounds
  const clampedValue = Math.max(
    1,
    Math.min(50, Number(value))
  );

  await prisma.user.update({
    where: { id: userId },
    data: { alertDropThreshold: clampedValue },
  });

  return NextResponse.json({ success: true });
}
