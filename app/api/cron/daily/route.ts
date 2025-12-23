// Deprecated in favor of /api/cron/scans guarded by CRON_SECRET.
// This route is kept for backward compatibility but does nothing.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, triggered: 0 });
}
