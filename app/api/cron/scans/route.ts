import { NextResponse } from "next/server";
import { runDueWebsiteScans } from "@/lib/cron/scanScheduler";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { triggered } = await runDueWebsiteScans();

  return NextResponse.json({
    ok: true,
    triggered,
  });
}
