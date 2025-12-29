import { NextResponse } from "next/server";
import { sendWeeklyMonitoringEmails } from "@/services/weeklyMonitoringService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { processedUsers, emailedUsers } = await sendWeeklyMonitoringEmails(
    weekAgo
  );

  return NextResponse.json({
    ok: true,
    processedUsers,
    emailedUsers,
  });
}
