import { NextRequest, NextResponse } from "next/server";
import { acknowledgeAlert } from "@/services/alertService";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await acknowledgeAlert(id);

  return NextResponse.json({ success: true });
}
