import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listRecentAlertsForUser } from "@/services/alertService";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ alerts: [] });
  }

  const alerts = await listRecentAlertsForUser(userId);

  return NextResponse.json({ alerts });
}
